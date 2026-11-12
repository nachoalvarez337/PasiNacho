# Pasinacho (app de pareja; antes "Cuentas de a dos")

## Objetivo del producto (cambió: ya no es solo para dos personas)
Plataforma para **parejas en general**, hecha de **módulos** que funcionan por separado dentro de **una sola app y una sola cuenta**. Cada pareja activa solo los módulos que quiere o compra, y cuando una pareja tiene un módulo, **lo usan los dos** (paga uno, usan ambos). Los módulos se pueden usar y vender por separado.

- **Hoy** la usan solo sus dos creadores, desde el celular, viendo los mismos datos al instante. Sus datos actuales (gastos, fotos, citas, notas) **se conservan** en todo cambio futuro.
- **Formato:** primero página web instalable en el celular (PWA); tiendas (Google Play / App Store) después.
- **Cómo se cobra:** aún no está decidido (precios, suscripción o pago único). No inventar precios ni cobros sin preguntar.
- El producto todavía **no está construido**: la app actual es el primer paso. Las reglas de "Cómo está hecha" valen **hoy** y cambiarán por fases (ver "Hoja de ruta").

## Módulos
Un módulo es una parte de la app con sus propios datos y su propio botón en la pantalla principal.

| Módulo | Qué incluye hoy | Colecciones que usa |
|---|---|---|
| **Finanzas** | Cuentas, pagos, calculadora y Resumen | `gastos`, `fotos` |
| **Recordatorios** | Lo que hoy es "Pendientes" (actividades con fecha, prioridad y responsable) | `tareas` |
| **Notas** | Notas tipo post-it | `notas` |
| **100 citas** | El álbum de citas | `citas`, `fotosCitas` |
| **Cine** | Películas y series por ver / vistas, calificación, comentario, ruleta y búsqueda de series | `cine` |
| **Metas** | Aún no existe (módulo nuevo, por definir) | por definir |

Reglas de módulos (valen para todo trabajo nuevo):
- Un módulo solo lee y escribe **sus propias colecciones**.
- Un módulo **no depende de otro** (por ejemplo, 100 citas no puede necesitar nada de Finanzas).
- Lo compartido vive en la plataforma, no dentro de un módulo: la cuenta (inicio de sesión), la pareja, los nombres (`config/nombres`) y la lista de módulos activos.
- Un módulo desactivado no aparece en la barra y la app no lee sus datos. **Sus datos no se borran**: quedan guardados por si lo vuelven a activar.
- Hoy todos los módulos están activos y siempre visibles: la activación por módulos es la fase 2 de la hoja de ruta.
- En el código los módulos están en la tabla `MODS` (nombre, ícono, pestañas internas, sección de entrada y secciones de la barra). Un módulo nuevo se agrega ahí.

## Hoja de ruta (cada fase se aprueba por separado, con su propio plan)
1. **Cuentas y parejas:** registro, recuperar contraseña y verificar correo; el concepto de "pareja" (un espacio con dos miembros, invitando a la otra persona con un código o enlace); datos guardados dentro de cada pareja con reglas de Firestore nuevas; **migrar los datos de los creadores sin perder nada**; dejar de usar `localStorage` (`cd_me`) para saber quién es quién.
2. **Módulos:** lista de módulos activos por pareja, barra y lectura de datos solo de los activos, pantalla "Módulos" (al principio activada a mano, sin cobro), y reglas de Firestore que también exijan el módulo activo.
3. **Seguridad y privacidad:** política de privacidad, términos de uso, borrar mi cuenta y mis datos, protección contra abuso (Firebase App Check). Revisar con alguien que sepa de la ley chilena de datos personales antes de publicar.
4. **Instalar como app (PWA):** ícono, pantalla de inicio y mejor uso sin conexión.
5. **Cobro y costos:** cobrar por módulo necesita un servicio de pagos y *Cloud Functions* (un pequeño servidor de Firebase que avisa a la app cuando se paga). Eso y el límite del plan gratis (lecturas, escrituras y espacio; las fotos dentro de Firestore salen caras con muchas parejas) probablemente exijan **plan de pago y Firebase Storage**, lo que hoy está prohibido más abajo. **Requiere decisión explícita del dueño.**
6. **Orden del código:** dividir el archivo único (un archivo por módulo). Rompe la regla "un solo archivo": preguntar antes.
7. **Tiendas:** empaquetar la web como app (cuentas de desarrollador pagadas y revisión de las tiendas; las tiendas cobran comisión por compras dentro de la app).
8. **Módulos nuevos:** Metas y Recordatorios ampliados, cada uno con su plan.
9. **Nombre, marca y precios.**

Preguntas abiertas: moneda y país (hoy todo es en pesos chilenos); si las 90 citas base serán iguales para todas las parejas o cada pareja arma su lista; si el repositorio seguirá público cuando haya producto; qué pasa con los datos y los módulos pagados si una pareja se separa; si algún módulo será gratis; la licencia comercial de TVmaze (ver módulo Cine).

## Hoy: app de una pareja de 21 años
Llevar las deudas entre los dos, guardar fotos de boletas, una lista de actividades pendientes, notas tipo post-it y el álbum "100 citas". Los dos la usan desde su celular y ven los mismos datos al instante.

## Cómo trabajar con el dueño del proyecto
- Responder siempre en **español**, con palabras simples. Si hace falta un concepto difícil, explicarlo en una frase.
- El código debe quedar **impecable y sin errores**. Antes de entregar: revisar la sintaxis del script (`node --check` sobre el contenido de la etiqueta `<script type="module">`) y probar la lógica nueva con datos de ejemplo.
- **No agregar funciones que no se pidieron.** Si se ocurren ideas, proponerlas y preguntar antes. Si hay una duda importante, preguntar.
- No romper datos existentes: cualquier cambio en cómo se guardan los datos debe seguir leyendo bien los registros antiguos.
- Este repositorio es **público**: nunca escribir correos, contraseñas ni claves privadas en archivos ni en mensajes de commit.

## Cómo está hecha (reglas vigentes HOY; lo marcado con "→ fase N" cambiará según la hoja de ruta)
- Un solo archivo: `index.html` (HTML + CSS + JavaScript). Sin herramientas de compilación. → fase 6.
- El script es un módulo (`<script type="module">`) que carga Firebase 10.14.1 desde `gstatic.com`.
- **Publicación:** GitHub Pages, desde la rama `main`, carpeta raíz. Dirección: https://nachoalvarez337.github.io/PasiNacho/. Lo que no esté en `main` no se ve publicado (tarda 1 o 2 minutos).
- **Firebase** (proyecto `pasinacho-c4b8c`, plan gratis Spark): Firestore (base `(default)`) y Authentication con correo/contraseña. Hay dos usuarios creados a mano en la consola; el registro público no se usa. → fase 1.
- **Reglas de Firestore:** solo pueden leer y escribir los dos correos autorizados (`request.auth.token.email in [...]`). Las reglas viven en la consola de Firebase, no en este repositorio. Cubren cualquier colección nueva. → fases 1 y 2.
- **No pasar a plan de pago ni agregar tarjeta.** No usar Firebase Storage (no está en el plan gratis): las fotos van dentro de Firestore. → fase 5, solo si el dueño lo decide de forma explícita.
- La configuración de Firebase (`firebaseConfig`) está en el archivo a propósito; es pública, la protección son el login y las reglas.
- La app necesita internet para guardar.

## Datos (Firestore)
Dos personas: `'a'` y `'b'`. Sus nombres están en `config/nombres` = `{a, b}`. Cada celular recuerda quién es con `localStorage` (clave `cd_me`). → fase 1.

- `gastos` (también guarda los pagos), campos:
  - `tipo`: `'gasto'` o `'pago'`.
  - `desc`, `monto`, `fecha` (`YYYY-MM-DD`), `cat` (comida, salidas, compras, transporte, hogar, otros), `nFotos`, `creado`.
  - `pagador`: `'a'` o `'b'`. En un gasto es quien pagó la cuenta; en un pago es quien devuelve plata.
  - **Importante:** en un gasto nuevo (`v: 2`), `monto` es el **Valor Deuda**: lo que el otro le debe a quien pagó, escrito a mano por el usuario. Los gastos viejos (sin `v`) guardaban el total y la deuda era `monto / 2`. La función `deudaDe(g)` resuelve las dos versiones.
  - En el formulario la pregunta es "¿Quién debe?"; al guardar, `pagador` es la **otra** persona.
  - `saldo()` > 0 significa que `b` le debe a `a`.
- `fotos`: `{gastoId, data, creado}`. `data` es una imagen JPEG en base64 achicada a menos de ~170.000 caracteres (límite de Firestore por documento: 1 MiB).
- `tareas`: `{titulo, fecha, prioridad: 'alta'|'media'|'baja', quien: 'a'|'b'|'ambos', hecha, hechaEn, creado}`.
- `notas`: `{texto (máx. 300), color, autor: 'a'|'b', creado}`. Solo el autor edita o elimina; la otra persona solo lee.
- `citas/{número}` (id `"1"`…`"100"`): `{num, nombre?, emoji?, hecha, fecha, lugar (máx. 80), sentir (máx. 1000), puntos (0–7), nFotos, mini, hechaEn, creado, editado}`.
  - Las 90 citas base viven en el código (`CITAS_BASE`: nombre + emoji). Si una cita no tiene documento, o no tiene `nombre`, se usa la base. Las citas 91–100 se crean desde la app (con `nombre`).
  - `hecha: true` = completada (se marca al guardar su registro). `mini` es una miniatura JPEG (< ~25.000 caracteres) para la cuadrícula. `editado` cambia en cada guardado y sirve para saber si hay que recargar las fotos.
- `cine/{id}`: `{titulo (máx. 100), tipo: 'pelicula'|'serie', anio ('' o 4 dígitos), afiche (miniatura JPEG propia, máx. ~40.000 caracteres, o ''), poster (enlace https de TVmaze o ''), tvmazeId, sinopsis (texto, máx. 400), visto, fecha, puntos (0–7), comentario (máx. 1000), creado, editado}`. Un título sin `visto` está "por ver".
- `fotosCitas/{número}_{1|2}`: `{citaId, slot, data, creado}`. Dos fotos por cita como máximo, una por documento, con el mismo límite que `fotos`.
- El código usa un adaptador `mkDb` que imita una API simple (`doc(ruta)`, `collection(nombre).doc()`, `.where().get()`, `.onSnapshot()`, `set(datos, {merge:true})`) sobre el SDK de Firebase.

## Decisiones de producto ya tomadas
- Montos en pesos chilenos (CLP), sin decimales.
- La calculadora (botón dentro de "Nuevo gasto") es una ventana superpuesta tipo iPhone. Es solo para estimar: **no guarda nada** y no rellena el Valor Deuda.
- Las actividades terminadas se tachan, no se borran solas; también se pueden eliminar a mano, con confirmación (igual que los gastos).
- **Pantalla principal:** al entrar se ve una pantalla rosada con la guirnalda de corazones, el nombre `“Pasinacho”` (nombre provisional; está en la constante `APP`) y los botones de los módulos: Finanzas, Recordatorios, Notas, 100 citas, Cine y, en gris con candado, Metas y +Más. Metas y +Más solo muestran el aviso "Próximamente".
  - Cada botón abre su módulo. Dentro, la barra de abajo tiene **🏠 Inicio** y las secciones del módulo (Finanzas: Cuentas y Resumen; los demás, solo Inicio). El encabezado muestra el nombre del módulo.
  - La pantalla principal no espera a que carguen los datos. Tiene su propio fondo (rosado; en modo oscuro, vino oscuro) y no lleva barra de abajo.
  - Si la cantidad de botones es impar, el último ocupa todo el ancho.
  - Nombres de clases CSS: la guirnalda es `.gar`, los botones `.mt`. **No reutilizar `.gl`**, que ya es el botón "vidrio" de las citas.
- **Cine:** lista de películas y series con filtros Por ver / Vistas / Todas (por defecto, Por ver) y buscador por título. "Ya la vimos" pide fecha, calificación de 1 a 7 corazones (opcional) y comentario; "Volver a por ver" borra ese registro. Las dos personas editan todo. Una sola calificación y un solo comentario por título.
  - **Ruleta "¿Qué vemos hoy?"** con filtros Todo / Películas / Series; elige solo entre lo que falta ver. Usa la ruleta reutilizable `ruleta(o)` (la misma de 100 citas); el módulo Chef también la usará.
  - **Series con búsqueda en TVmaze** (`https://api.tvmaze.com/search/shows?q=`; gratis, sin clave, ~20 búsquedas cada 10 segundos): se busca en el momento y **solo se guarda lo elegido** (título, año, enlace al afiche y sinopsis), no un catálogo. Siempre debe verse el crédito "Series: datos de TVmaze" con enlace. Las películas se agregan a mano; el afiche propio se guarda achicado.
  - Seguridad: el afiche de TVmaze solo se acepta si empieza con `https://static.tvmaze.com/`; la sinopsis se convierte a texto plano; todo se escapa al mostrarlo. Si la búsqueda falla, se puede escribir a mano.
  - **Pendiente antes de cobrar la app:** confirmar en el sitio oficial de TVmaze si su licencia (CC BY-SA 4.0 con crédito) permite el uso comercial. TMDB no se usa porque exige un acuerdo comercial para apps que se venden. Desde la sesión de desarrollo no se pudo probar TVmaze real (el entorno bloquea ese sitio): la búsqueda se probó con respuestas simuladas.
- **100 citas** (módulo "100 citas"): cada cita es una hoja con el estilo del cuadernillo (papel kraft, dos polaroids, Fecha, Lugar, "¿Cómo nos sentimos?") y una nota de 1 a 7 corazones (opcional). Filtros Todas / Pendientes / Completadas, buscador por nombre o número, y "¿Qué hacemos hoy?" que elige al azar una pendiente. Las dos personas pueden editar cualquier cita.
  - **Cambiar el nombre de una cita borra su registro y sus fotos** (con aviso). Cambiar solo el emoji no borra nada. "Borrar registro" la vuelve a pendiente.
  - Fuentes Caveat y Righteous desde Google Fonts. La pantalla principal también usa Pacifico (el título).
  - **Fotos en el celular (Android):** el selector de foto de cada polaroid (`input[type=file]`) debe quedar **visible encima del marco** (invisible con `opacity:0`, nunca con `display:none`): así se toca directo. En Chrome para Android un selector escondido a veces no avisa que se eligió la foto y la cita se guardaba sin fotos. La foto se recibe por cualquiera de estos caminos: avisos `change`/`input`, al volver a la página desde la galería, o al apretar "Guardar registro" (función `tomarFoto`). Si una foto no sirve, el marco y un aviso lo dicen.
- Nunca se pidió dividir distinto de mitad y mitad ni una copia de seguridad (aún no se hace).

## Ideas aún NO implementadas (preguntar antes de hacer cualquiera)
Botón "Descargar copia"; gastos fijos que se repiten; presupuesto mensual; confirmar deudas; buscar y filtrar movimientos; gráficos; fechas importantes con cuenta regresiva; lista de planes por hacer; lista de compras; reacciones en las notas; resumen semanal; PIN de acceso; avisos al celular.

Ya planificadas como parte de la hoja de ruta, pero **sin empezar** (cada una pide su propio plan y aprobación): módulo **Metas** (incluye las "metas de ahorro"), módulo **Recordatorios** ampliado, instalar como app (PWA, fase 4).

## Probar y publicar
- No hay servidor propio. Para probar localmente: `python3 -m http.server` y abrir `localhost` (el inicio de sesión de Firebase puede fallar abriendo el archivo directo).
- Para publicar: dejar los cambios en `main`. Si se trabaja en otra rama, hay que fusionarla (merge) en `main` para que GitHub Pages la publique.
