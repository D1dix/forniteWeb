# PREMIAZO Studio — cómo ponerla en marcha (unos 20 minutos, una sola vez)

La app es una página web gratuita alojada en GitHub Pages. No hay servidor:
- Tu clave de ElevenLabs y tu acceso a Drive se quedan **solo en tu navegador**.
- Los vídeos se montan en tu propio ordenador, dentro de Chrome.

---

## 1. Subir la app a GitHub Pages
1. Crea una cuenta gratis en https://github.com (si ya tienes una, entra con ella).
2. Arriba a la derecha pulsa **+ → New repository**.
   - Nombre: `premiazo-studio`.
   - Márcalo como **Public**: GitHub Pages gratis solo funciona con repositorios públicos. El código no lleva ninguna clave, así que no pasa nada.
   - Pulsa **Create repository**.
3. En el repositorio pulsa **uploading an existing file**. Arrastra `index.html`, `styles.css`, `templates.js`, `app.js` y `mp4-muxer.js`, y pulsa **Commit changes**.
4. Si el repositorio quedó como privado y Pages te pide "Upgrade or make this repository public":
   - Ve a **Settings → General** y baja del todo, a **Danger Zone**.
   - Pulsa **Change visibility → Change to public** y confirma.
5. Ve a **Settings → Pages**.
   - En *Branch* elige `main` y la carpeta `/ (root)`.
   - Pulsa **Save**.
6. Espera 1–2 minutos. Tu app estará en: `https://TU_USUARIO.github.io/premiazo-studio/`

> Para actualizar la app más adelante (por ejemplo, cuando Germán la mejore), solo hay que volver a subir los archivos cambiados.

## 2. Permiso para usar tu Google Drive (ID de cliente)
1. Entra en https://console.cloud.google.com con diegomartinperez05@gmail.com.
2. Crea un proyecto:
   - Arriba, en el selector de proyecto, pulsa **Proyecto nuevo**.
   - Nombre: `PREMIAZO Studio` → **Crear**.
3. **APIs y servicios → Biblioteca** → busca **Google Drive API** → **Habilitar**.
4. **APIs y servicios → Pantalla de consentimiento de OAuth** (en algunas cuentas se llama *Google Auth Platform*):
   - Tipo: **Externo**.
   - Nombre de la app: `PREMIAZO Studio`.
   - Pon tu correo como correo de soporte y como contacto.
   - En **Usuarios de prueba / Audiencia**, añade tu propio correo, diegomartinperez05@gmail.com.
5. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - En **Orígenes de JavaScript autorizados**, añade solo `https://TU_USUARIO.github.io`: sin barra final y sin el nombre del repositorio detrás. Si pones algo después del `.io`, Google da el error «Origen no válido: Los URI no deben contener una ruta…».
   - Pulsa **Crear** y copia el **ID de cliente**. Termina en `.apps.googleusercontent.com`.
6. La primera vez que conectes, Google avisará de que la app "no está verificada". Es normal, porque la has creado tú: pulsa **Configuración avanzada → Ir a PREMIAZO Studio**.

## 3. Configurar la app (pestaña **Ajustes**)
1. **Clave de ElevenLabs:**
   - En elevenlabs.io ve a tu perfil → **API Keys** → crea una clave y pégala en la app.
   - Pulsa **Probar conexión**: tiene que salir "Conectado ✓".
   - No la pegues en ningún otro sitio: ni chats, ni WhatsApp, ni en el código de GitHub.
2. **ID de cliente de Google:** pega el del paso 2 y pulsa **Conectar Drive**.
3. Revisa el código del mapa, el nombre y los "hechos". Pulsa **Guardar**.

## 4. Uso diario (automático)
1. Abre la app → **Crear Short** → **🤖 Lote automático del día**.
2. (Opcional) Escribe la skin protagonista. Si lo dejas vacío, usa la primera de `SKINS_PRIORIDAD.txt`.
3. Pulsa **🤖 Hacer los Shorts del día** y deja la pestaña delante (unos 5 minutos). La app:
   - lee tu Drive;
   - elige 6 formatos distintos: skin nueva, token, reacción, pack de skins, top y mapa;
   - no repite skin;
   - escribe los guiones, pone voz y música y monta los vídeos.
4. Al terminar, en **08_SHORTS_LISTOS** de tu Drive tendrás por cada Short:
   - el vídeo `.mp4`;
   - la portada `_PORTADA.jpg`;
   - el texto `_TEXTOS.txt`, con título, descripción, etiquetas y comentario fijado en ES/EN/PT/FR.
5. Revisa cada vídeo antes de publicarlo.

Si quieres hacer uno a mano, debajo sigue el modo manual. Ahí el botón **⚡ Rellenar con clips** elige los clips por ti.

## Formato «Máquina / caja fuerte → sale skin» (nuevo en v1.7)
La caja fuerte y la skin van al final, como remate:
1. **0–3 s:** búsqueda del código en el menú, con el gancho («MIRA LO QUE SALE AL FINAL…») y luego «CÓDIGO 2678-6238-9804».
2. **3–12 s:** gameplay del mapa con «+XP SIN PARAR» o «¡TOKEN PIRATA!».
3. **12–14 s:** te acercas a la máquina registradora o la caja fuerte. Al final aparece un botón **X** de Xbox que late y se pulsa.
4. **14–18 s:** destello y sale la skin, con su nombre en grande.
5. **Final:** cierre con el código.

Para que funcione, la biblioteca necesita:
- **Clip de la máquina:** nómbralo `MAPA__caja_fuerte_01.mp4`, `MAPA__maquina_01.mp4` o `MAPA__registradora_01.mp4`, en cualquier carpeta. Graba desde que te acercas hasta que sale el botón X (unos 3 s). Si no hay ninguno, la app usa `MAPA__gameplay_01`.
- **Clip de la skin saliendo:** en `02_SKINS/Cuando_sale`, o con `__recompensa` en el nombre, por ejemplo `RENEGADA__recompensa_01.mp4`.

Lo encuentras en **Crear Short → Categoría → Máquina / caja fuerte → sale skin**. El lote automático también lo hace, siempre con una skin distinta de la de «Skin nueva».

## Notas
- Usa **Google Chrome** en un ordenador. Los móviles no sirven para montar vídeos.
- Normalmente el vídeo sale en `.mp4`. Si tu Chrome no puede, sale `.webm`, que YouTube también acepta.
- Coste de ElevenLabs:
  - Cada voz se genera una sola vez: si repites el mismo texto, la app la reutiliza gratis.
  - La música y el efecto de transición también se guardan para la siguiente vez.
- Si "Probar conexión" falla con un error de red, avísame. Tendríamos que poner un pequeño intermediario gratuito (Cloudflare Worker), que también sirve para el paso futuro a un servidor.
