# Publicar no Vercel (login github)

```bash
npx expo export:web
npm install -g vercel@latest
```

- crie o arquivo vercel.json no root:

````json
{
  "buildCommand": "expo export:web",
  "outputDirectory": "web-build",
  "devCommand": "expo",
  "cleanUrls": true,
  "framework": null,
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/"
    }
  ]
}

```bash
vercel
````
