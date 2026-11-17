// Pasinacho: mini servidor de avisos (Cloudflare Worker, plan gratis).
// Recibe el texto de un aviso desde la app, comprueba que quien lo pide es una de las personas autorizadas
// y le pide a Firebase Cloud Messaging que lo entregue al celular de la otra persona.
//
// Este archivo NO lleva claves. En Cloudflare > el Worker > Configuración > Variables y secretos, crear dos SECRETOS:
//   CUENTA  = el contenido completo del archivo .json de la cuenta de servicio (la que solo puede enviar avisos)
//   CORREOS = los correos autorizados, separados por coma
// Opcionales (texto normal): PROYECTO (id del proyecto de Firebase) y ORIGEN (direcciones permitidas, separadas por coma).

const PROYECTO = 'pasinacho-c4b8c';
const ORIGEN = 'https://nachoalvarez337.github.io';
const MAX_TOKENS = 6, MAX_TITULO = 60, MAX_CUERPO = 160, MAX_PEDIDO = 20000;
const CLAVES_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const b64u = s => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
const aB64u = u => { let b = ''; for (const x of new Uint8Array(u)) b += String.fromCharCode(x); return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const txt = u => new TextDecoder().decode(u);
const bin = s => new TextEncoder().encode(s);
const corta = (s, n) => { const A = Array.from(String(s == null ? '' : s).replace(/\s+/g, ' ').trim()); return A.length > n ? A.slice(0, n - 1).join('') + '…' : A.join(''); };
const lista = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);

// Claves públicas de Google para comprobar el inicio de sesión de Firebase (se recuerdan mientras duren)
let claves = null, clavesHasta = 0;
async function clavesGoogle(ahora) {
  if (claves && ahora < clavesHasta) return claves;
  const r = await fetch(CLAVES_URL);
  if (!r.ok) throw new Error('claves ' + r.status);
  const j = await r.json(), m = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  if (!j || !Array.isArray(j.keys)) throw new Error('claves mal formadas');
  claves = j.keys; clavesHasta = ahora + Math.min(m ? +m[1] : 3600, 21600) * 1000;
  return claves;
}

// Devuelve los datos del inicio de sesión si es válido; si no, null
async function sesion(token, proyecto, ahora) {
  const p = String(token || '').split('.');
  if (p.length !== 3) return null;
  let h, d;
  try { h = JSON.parse(txt(b64u(p[0]))); d = JSON.parse(txt(b64u(p[1]))); } catch (e) { return null; }
  if (!h || !d || h.alg !== 'RS256' || typeof h.kid !== 'string') return null;
  const s = Math.floor(ahora / 1000);
  if (d.aud !== proyecto || d.iss !== 'https://securetoken.google.com/' + proyecto) return null;
  if (typeof d.sub !== 'string' || !d.sub) return null;
  if (!(d.exp > s) || !(d.iat <= s + 300)) return null;
  const jwk = (await clavesGoogle(ahora)).find(k => k.kid === h.kid);
  if (!jwk) return null;
  let firma;
  try { firma = b64u(p[2]); } catch (e) { return null; }
  const k = await crypto.subtle.importKey('jwk', {kty:jwk.kty, n:jwk.n, e:jwk.e, alg:'RS256', ext:true}, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', k, firma, bin(p[0] + '.' + p[1]));
  return ok ? d : null;
}

// Permiso de Google para enviar avisos, con la cuenta de servicio (se recuerda hasta poco antes de vencer)
let acceso = '', accesoHasta = 0;
async function permiso(cuenta, ahora) {
  if (acceso && ahora < accesoHasta) return acceso;
  const pem = String(cuenta.private_key || '').replace(/\\n/g, '\n').replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
  const k = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['sign']);
  const s = Math.floor(ahora / 1000);
  const cab = aB64u(bin(JSON.stringify({alg:'RS256', typ:'JWT'})));
  const cue = aB64u(bin(JSON.stringify({iss:cuenta.client_email, scope:'https://www.googleapis.com/auth/firebase.messaging', aud:'https://oauth2.googleapis.com/token', iat:s, exp:s + 3600})));
  const firma = aB64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', k, bin(cab + '.' + cue)));
  const r = await fetch('https://oauth2.googleapis.com/token', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + cab + '.' + cue + '.' + firma});
  const j = await r.json().catch(() => null);
  if (!r.ok || !j || typeof j.access_token !== 'string') throw new Error('permiso ' + r.status);
  acceso = j.access_token; accesoHasta = ahora + (Math.min(+j.expires_in || 3600, 3600) - 300) * 1000;
  return acceso;
}

// Envía un aviso a un celular. Devuelve 'ok', 'muerto' (esa dirección ya no sirve) o 'error:<código>'
async function enviar(proyecto, acc, token, datos) {
  const r = await fetch('https://fcm.googleapis.com/v1/projects/' + proyecto + '/messages:send', {
    method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer ' + acc},
    body:JSON.stringify({message:{token, data:datos, webpush:{headers:{Urgency:'high', TTL:'86400'}}}})
  });
  if (r.ok) return 'ok';
  const t = await r.text().catch(() => '');
  if (r.status === 404 || /UNREGISTERED|SENDER_ID_MISMATCH/.test(t)) return 'muerto';
  return 'error:' + r.status;
}

async function atender(req, env) {
  const origenes = lista(env.ORIGEN || ORIGEN), proyecto = env.PROYECTO || PROYECTO;
  const o = req.headers.get('Origin') || '', permitido = origenes.includes(o);
  const cors = permitido ? {'Access-Control-Allow-Origin':o, 'Vary':'Origin'} : {};
  const resp = (codigo, cuerpo) => new Response(JSON.stringify(cuerpo), {status:codigo, headers:Object.assign({'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'}, cors)});

  if (req.method === 'OPTIONS') return new Response(null, {status:permitido ? 204 : 403, headers:Object.assign({'Access-Control-Allow-Methods':'POST', 'Access-Control-Allow-Headers':'Authorization, Content-Type', 'Access-Control-Max-Age':'86400'}, cors)});
  if (req.method === 'GET') return resp(200, {ok:true, servicio:'Avisos de Pasinacho'});
  if (req.method !== 'POST') return resp(405, {error:'metodo'});
  if (!permitido) return resp(403, {error:'origen'});

  const correos = lista(env.CORREOS).map(x => x.toLowerCase());
  let cuenta = null;
  try { cuenta = JSON.parse(env.CUENTA); } catch (e) {}
  if (!correos.length || !cuenta || !cuenta.client_email || !cuenta.private_key) return resp(500, {error:'sin-configurar'});

  const ahora = Date.now(), au = req.headers.get('Authorization') || '';
  const d = au.startsWith('Bearer ') ? await sesion(au.slice(7), proyecto, ahora) : null;
  if (!d) return resp(401, {error:'sesion'});
  if (typeof d.email !== 'string' || !correos.includes(d.email.toLowerCase())) return resp(403, {error:'correo'});

  const crudo = await req.text();
  if (crudo.length > MAX_PEDIDO) return resp(400, {error:'largo'});
  let b = null;
  try { b = JSON.parse(crudo); } catch (e) {}
  if (!b || typeof b !== 'object' || !Array.isArray(b.tokens)) return resp(400, {error:'pedido'});
  const tokens = [...new Set(b.tokens)];
  if (!tokens.length || tokens.length > MAX_TOKENS || !tokens.every(t => typeof t === 'string' && t.length > 20 && t.length < 4096)) return resp(400, {error:'tokens'});
  const titulo = corta(b.titulo, MAX_TITULO), cuerpo = corta(b.cuerpo, MAX_CUERPO);
  if (!titulo || !cuerpo || typeof b.titulo !== 'string' || typeof b.cuerpo !== 'string') return resp(400, {error:'texto'});
  const mod = /^[a-z]{1,20}$/.test(b.mod || '') ? b.mod : 'general';

  const acc = await permiso(cuenta, ahora);
  const R = await Promise.all(tokens.map(t => enviar(proyecto, acc, t, {titulo, cuerpo, mod}).catch(() => 'error:red')));
  return resp(200, {ok:true, enviados:R.filter(x => x === 'ok').length, muertos:tokens.filter((t, i) => R[i] === 'muerto'), errores:R.filter(x => x.startsWith('error'))});
}

export default {
  async fetch(req, env) {
    try { return await atender(req, env || {}); }
    catch (e) { return new Response(JSON.stringify({error:'interno'}), {status:500, headers:{'Content-Type':'application/json; charset=utf-8'}}); }
  }
};
