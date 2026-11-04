# Cuentas de a dos (app de pareja)

App web para una pareja de 21 años: llevar las deudas entre los dos, guardar fotos de boletas, una lista de actividades pendientes y notas tipo post-it. Los dos la usan desde su celular y ven los mismos datos al instante.

## Cómo trabajar con el dueño del proyecto
- Responder siempre en **español**, con palabras simples. Si hace falta un concepto difícil, explicarlo en una frase.
- El código debe quedar **impecable y sin errores**. Antes de entregar: revisar la sintaxis del script (`node --check` sobre el contenido de la etiqueta `<script type="module">`) y probar la lógica nueva con datos de ejemplo.
- **No agregar funciones que no se pidieron.** Si se ocurren ideas, proponerlas y preguntar antes. Si hay una duda importante, preguntar.
- No romper datos existentes: cualquier cambio en cómo se guardan los datos debe seguir leyendo bien los registros antiguos.
- Este repositorio es **público**: nunca escribir correos, contraseñas ni claves privadas en archivos ni en mensajes de commit.

## Cómo está hecha
- Un solo archivo: `index.html` (HTML + CSS + JavaScript). Sin herramientas de compilación.
- El script es un módulo (`<script type="module">`) que carga Firebase 10.14.1 desde `gstatic.com`.
- **Publicación:** GitHub Pages, desde la rama `main`, carpeta raíz. Dirección: https://nachoalvarez337.github.io/PasiNacho/. Lo que no esté en `main` no se ve publicado (tarda 1 o 2 minutos).
- **Firebase** (proyecto `pasinacho-c4b8c`, plan gratis Spark): Firestore (base `(default)`) y Authentication con correo/contraseña. Hay dos usuarios creados a mano en la consola; el registro público no se usa.
- **Reglas de Firestore:** solo pueden leer y escribir los dos correos autorizados (`request.auth.token.email in [...]`). Las reglas viven en la consola de Firebase, no en este repositorio. Cubren cualquier colección nueva.
- **No pasar a plan de pago ni agregar tarjeta.** No usar Firebase Storage (no está en el plan gratis): las fotos van dentro de Firestore.
- La configuración de Firebase (`firebaseConfig`) está en el archivo a propósito; es pública, la protección son el login y las reglas.
- La app necesita internet para guardar.

## Datos (Firestore)
Dos personas: `'a'` y `'b'`. Sus nombres están en `config/nombres` = `{a, b}`. Cada celular recuerda quién es con `localStorage` (clave `cd_me`).

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
- El código usa un adaptador `mkDb` que imita una API simple (`doc(ruta)`, `collection(nombre).doc()`, `.where().get()`, `.onSnapshot()`) sobre el SDK de Firebase.

## Decisiones de producto ya tomadas
- Montos en pesos chilenos (CLP), sin decimales.
- La calculadora (botón dentro de "Nuevo gasto") es una ventana superpuesta tipo iPhone. Es solo para estimar: **no guarda nada** y no rellena el Valor Deuda.
- Las actividades terminadas se tachan, no se borran solas; también se pueden eliminar a mano, con confirmación (igual que los gastos).
- Nunca se pidió dividir distinto de mitad y mitad ni una copia de seguridad (aún no se hace).

## Ideas aún NO implementadas (preguntar antes de hacer cualquiera)
Botón "Descargar copia"; gastos fijos que se repiten; metas de ahorro; presupuesto mensual; confirmar deudas; buscar y filtrar movimientos; gráficos; fechas importantes con cuenta regresiva; lista de planes por hacer; lista de compras; reacciones en las notas; resumen semanal; instalar como app (PWA); PIN de acceso; avisos al celular.

## Probar y publicar
- No hay servidor propio. Para probar localmente: `python3 -m http.server` y abrir `localhost` (el inicio de sesión de Firebase puede fallar abriendo el archivo directo).
- Para publicar: dejar los cambios en `main`. Si se trabaja en otra rama, hay que fusionarla (merge) en `main` para que GitHub Pages la publique.
