# Piphex AI backend

This keeps `OPENAI_API_KEY` off the public Carrd page.

## Deploy with GitHub and Render

1. Create a new **private** GitHub repository named `piphex-ai-backend`.
2. Upload these files. Never upload `.env.local`.
3. In Render, create a new Blueprint or Web Service from that repository.
4. Add the secret environment variable `OPENAI_API_KEY` in Render.
5. Deploy and copy the service URL, such as `https://piphex-ai.onrender.com`.
6. In `carrd-piphex-ai-embed.html`, replace `https://YOUR-PIPHEX-BACKEND.onrender.com`.
7. Paste the full Carrd file into a Hidden / Body End Code Embed and publish.

The server accepts requests only from `gizmolifemedia.com` and `www.gizmolifemedia.com`, limits message size and recent conversation history, and applies a simple per-IP rate limit.
