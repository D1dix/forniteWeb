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
3. En el repositorio pulsa **uploading an existing file**. Arrastra `index.html`, `styles.css`, `templates.js` y `app.js`, y pulsa **Commit changes**.
4. Ve a **Settings → Pages**.
   - En *Branch* elige `main` y la carpeta `/ (root)`.
   - Pulsa **Save**.
5. Espera 1–2 minutos. Tu app estará en: `https://TU_USUARIO.github.io/premiazo-studio/`

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
   - En **Orígenes de JavaScript autorizados**, añade `https://TU_USUARIO.github.io` (sin la barra final y sin `/premiazo-studio`).
   - Pulsa **Crear** y copia el **ID de cliente**. Termina en `.apps.googleusercontent.com`.
6. La primera vez que conectes, Google avisará de que la app "no está verificada". Es normal, porque la has creado tú: pulsa **Configuración avanzada → Ir a PREMIAZO Studio**.

## 3. Configurar la app (pestaña **Ajustes**)
1. **Clave de ElevenLabs:**
   - En elevenlabs.io ve a tu perfil → **API Keys** → crea una clave y pégala en la app.
   - Pulsa **Probar conexión**: tiene que salir "Conectado ✓".
   - No la pegues en ningún otro sitio: ni chats, ni WhatsApp, ni en el código de GitHub.
2. **ID de cliente de Google:** pega el del paso 2 y pulsa **Conectar Drive**.
3. Revisa el código del mapa, el nombre y los "hechos". Pulsa **Guardar**.

## 4. Uso diario
1. **Biblioteca → Cargar desde Drive.** Lee la carpeta `PREMIAZO_Biblioteca_FINAL`.
   - Si Drive falla, usa **Elegir archivos del ordenador**.
2. Busca la skin (por ejemplo, `LOBO`). Pulsa **Ver** para revisar un clip y **＋** para añadirlo al Short. Puedes añadirlo en el segundo exacto que estás viendo.
   - El **primer** clip es el gancho y el **último** es la revelación.
3. **Crear Short:**
   - Elige la categoría y el idioma, y pulsa **Generar guion**. Si quieres otra versión, pulsa **Otra versión**.
   - Pulsa **Generar voz** (ElevenLabs).
   - Pulsa **Montar Short**. Tarda lo mismo que dura el vídeo (unos 15–20 s). **No cambies de pestaña mientras graba.**
4. **Descargar** o **Guardar en Drive** (lo guarda en `08_SHORTS_LISTOS`).
5. **Publicar:**
   - **Hacer portada**: elige el clip y el segundo exactos.
   - **Generar textos**: título, descripción, etiquetas y comentario fijado en ES/EN/PT/FR, con botones para copiar.

La app avisa si ya has hecho hoy un Short de esa categoría, para que los 6 del día sean distintos.

## Notas
- Usa **Google Chrome** en un ordenador. Los móviles no sirven para montar vídeos.
- Normalmente el vídeo sale en `.mp4`. Si tu Chrome no puede, sale `.webm`, que YouTube también acepta.
- Coste de ElevenLabs:
  - Cada voz se genera una sola vez: si repites el mismo texto, la app la reutiliza gratis.
  - La música y el efecto de transición también se guardan para la siguiente vez.
- Si "Probar conexión" falla con un error de red, avísame. Tendríamos que poner un pequeño intermediario gratuito (Cloudflare Worker), que también sirve para el paso futuro a un servidor.
