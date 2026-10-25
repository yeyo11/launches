---
title: "Shipcast: lanza tus proyectos de GitHub sin escribir el anuncio diez veces"
description: "Shipcast lee el código de tu repo en cada release, escribe una pieza para cada canal y publica cada una cuando la apruebas. Así funciona y así se ejecuta."
pubDate: 2026-10-25
lang: es
translationKey: "shipcast-launch-your-github-projects"
repo: "https://github.com/yeyo11/shipcast"
version: "v0.1.0"
tags: ["github", "automation", "ai", "opensource"]
image: "/launches/shipcast/v0.1.0/og.png"
---

Publicas una release y te pasas una tarde con el mismo anuncio: un artículo en el blog, una copia en dev.to, un post en Bluesky, otro en Mastodon, un carrusel de Instagram, un número de la newsletter, un título para Show HN. Cada uno tiene su límite de longitud y su tono, y el error más fácil es prometer en alguno algo que el código todavía no hace.

Shipcast hace ese trabajo a partir de la release. Lee el **código** del proyecto, no solo el README, escribe una pieza para cada canal y publica cada una cuando tú la apruebas. Lo usé para lanzar [claudio](https://github.com/yeyo11/claudio) v0.9.0, y este artículo forma parte de su propio lanzamiento.

## Qué obtienes

- El artículo en tu blog en inglés y en español, cada uno con su URL.
- Copias canónicas en dev.to (y en Hashnode, construido pero aún sin probar en real).
- Posts en Bluesky y Mastodon, y un carrusel de Instagram con su story y un comentario.
- Un número de newsletter por idioma a través de Brevo.
- Borradores de Show HN y Product Hunt listos para pegar: ninguno tiene API para publicar, así que Shipcast nunca los publica.
- Conectores de Telegram y Discord, y las cifras de cada canal en la página del lanzamiento.

## Activa cada repo

Un proyecto activa los lanzamientos con `.github/launch.yml`. Cada canal tiene un modo:

```yaml
enabled: true
brand: personal
language: es

publishing:
  blog: approval
  devto: approval
  bluesky: approval
  hackerNews: manual

assets:
  demo: docs/media/tour.gif
```

`auto` publica en cuanto se genera el pack, `approval` publica cuando haces merge de los borradores, `manual` deja un borrador que publicas tú y `off` salta el canal. Hacker News y Product Hunt rechazan cualquier modo que no sea `manual` u `off`. El esquema es estricto: una clave mal escrita es un error que apunta a su línea, en vez de un ajuste ignorado en silencio.

## Comprueba primero el repo

Antes de gastar nada de IA, el pre-flight confirma que el repo está listo:

```bash
pnpm shipcast preflight owner/repo
```

Comprueba que haya una release publicada, un `launch.yml` válido y activado, una licencia que GitHub reconozca, un README y una demo que responda. Cada línea sale como `ok`, `warn` o `FAIL`, y `launch` no arranca mientras falle una comprobación obligatoria.

## Lanza

Hay dos formas. A mano, para la última release o para una etiqueta concreta:

```bash
pnpm shipcast launch owner/repo --ref v1.2.0
```

O dejando que el motor vigile tu cuenta:

```bash
pnpm shipcast watch --interval 300
```

`watch` consulta tus eventos públicos de GitHub (sin webhooks, así que no expones nada de tu máquina), redacta cada release nueva, la publica cuando se hace merge de su pull request y lee las métricas cada seis horas. El intervalo no baja de 60 segundos, que es lo que GitHub pide a quien consulta los eventos.

## Cómo funciona

1. **Analiza.** Claude, a través de [claudio](https://github.com/yeyo11/claudio), lee el repositorio y separa lo que está implementado de lo que solo está planeado o solo aparece en la documentación. Solo lo implementado se presenta como funcionando.
2. **Genera.** El resultado es un pack de contenido estructurado, validado con un JSON Schema: el artículo en cada idioma y una pieza para cada canal dentro de sus límites. Shipcast también crea la imagen del lanzamiento, el carrusel y la story de Instagram, y una portada con el estilo de tu blog si el proyecto no tiene.
3. **Aprueba.** Los borradores llegan como un pull request en tu repo de lanzamientos, que además es el código fuente de tu blog. Léelos y edítalos en la app o en GitHub; el merge publica.
4. **Publica una vez.** Un registro en SQLite anota cada lanzamiento y cada canal. Volver a ejecutar un workflow o publicar una versión menor no repite una campaña, y un canal que falló del todo se puede reintentar:

```bash
pnpm shipcast publish --retry bluesky
```

`pnpm shipcast status` lista los últimos lanzamientos, en qué punto está cada uno y qué canales hay configurados.

## La app

```bash
pnpm app
```

La app web tiene Launches (adónde fue cada uno y qué te espera), una página de revisión (editar, aprobar, reintentar), Launch a repo, Write y Channels. Write toma un artículo escrito con tus palabras, lo traduce, escribe la pieza de cada canal y lo publica igual. Channels lista cada red con sus cuentas por marca, comprueba cada credencial, hace el OAuth de Mastodon e Instagram y guarda los secretos en el llavero de tu sistema operativo. El acceso es con GitHub, limitado a los usuarios que permitas.

La marca personal y la de empresa tienen sus propias cuentas, tono e idioma, y un lanzamiento solo usa las cuentas de su marca.

## Puesta en marcha

Necesitas Node 24 y pnpm, [claudio](https://github.com/yeyo11/claudio) como proveedor de IA (el `docker-compose.yml` del repo lo arranca), un repo de lanzamientos con un blog en Astro que acepte los artículos ([docs/launches-repo.md](https://github.com/yeyo11/shipcast/blob/main/docs/launches-repo.md) describe el contrato) y una cuenta en cada red que quieras. En Linux el llavero necesita `libsecret-tools`, y el vídeo de la demo necesita ffmpeg.

```bash
pnpm install
cp .env.example .env              # rellena lo que uses
pnpm shipcast preflight owner/repo
pnpm shipcast launch owner/repo   # o: pnpm app
```

Una red o fuente sin sus variables se deja fuera, y `pnpm shipcast status` muestra qué está activo.

## Lo que viene

La siguiente fase incluye otros proveedores de IA además de claudio, un modo GitHub Action, una instalación con un solo comando y la configuración de la marca de empresa. La prueba de esta versión es lanzar Shipcast con Shipcast en todos los canales conectados.

El código tiene licencia MIT en [github.com/yeyo11/shipcast](https://github.com/yeyo11/shipcast). Las issues son bienvenidas; abre una antes de enviar un pull request.
