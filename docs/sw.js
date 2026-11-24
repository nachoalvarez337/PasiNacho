// Pasinacho: recibe los avisos al celular aunque la app esté cerrada.
// Los navegadores exigen que esto sea un archivo aparte de index.html. No guarda la app ni datos.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

const corta = (s, n) => { const A = Array.from(String(s == null ? '' : s).replace(/\s+/g, ' ').trim()); return A.length > n ? A.slice(0, n - 1).join('') + '…' : A.join(''); };

self.addEventListener('push', e => {
  let j = {};
  try { j = (e.data && e.data.json()) || {}; } catch (x) {}
  const d = (j && typeof j.data === 'object' && j.data) || {}, n = (j && typeof j.notification === 'object' && j.notification) || {};
  const titulo = corta(d.titulo || n.title, 60) || 'Pasinacho';
  const cuerpo = corta(d.cuerpo || n.body, 160) || 'Hay algo nuevo 💞';
  const mod = /^[a-z]{1,20}$/.test(d.mod || '') ? d.mod : 'general';
  // Siempre se muestra algo: Chrome exige una notificación por cada aviso recibido
  e.waitUntil(self.registration.showNotification(titulo, {body:cuerpo, tag:'pasinacho-' + mod, renotify:true, lang:'es'}));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const base = self.registration.scope;
  e.waitUntil((async () => {
    const L = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    const c = L.find(x => x.url.startsWith(base));
    if (c && 'focus' in c) return c.focus();
    return self.clients.openWindow(base);
  })());
});
