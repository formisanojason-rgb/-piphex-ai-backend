# GizmoMedia AI

Secure Node.js backend and Carrd widget for Gizmolife Media.

## Local test

The API key is read from the workspace `.env.local` file. From this folder run:

```powershell
npm start
```

Then open `http://127.0.0.1:4173`.

## Render settings

- Service type: Web Service
- Runtime: Node
- Build command: leave blank or use `npm install`
- Start command: `npm start`
- Environment variable: `OPENAI_API_KEY` (paste the secret into Render; never put it in Carrd or GitHub)
- Health check: `/health`

After Render assigns the service address, replace `YOUR-RENDER-ADDRESS` in `carrd-embed.html`, then paste that code into a Carrd Embed element.

The widget shows one sound control: **Mute**. The visitor opens or closes the panel by clicking the GizmoMedia character.
