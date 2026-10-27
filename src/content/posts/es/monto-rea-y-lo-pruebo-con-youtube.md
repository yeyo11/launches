---
title: "Monto REA y lo pruebo con YouTube: qué acierta y qué no"
description: "Instalo REA en Claude Code y le pregunto qué carga, qué envía y cómo elige la calidad el reproductor de YouTube, comprobando cada respuesta con mi propio registro de red."
pubDate: 2026-10-27
lang: es
translationKey: "i-set-up-rea-and-test-it-on-youtube"
tags: ["rea", "claudecode", "mcp", "reverseengineering"]
image: "/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/og.png"
imageAlt: "REA (Reverse Engineer Anything) analizando el reproductor de YouTube desde Claude Code"
---

Quería saber qué hace de verdad el reproductor de YouTube cuando le das al play: qué descarga, qué envía mientras miras y cómo decide la calidad. Las DevTools del navegador te lo enseñan petición a petición, pero leer cientos de peticiones y 13 MB de JavaScript minificado a mano no es un plan. Así que monté [REA](https://github.com/morluto/rea) (Reverse Engineer Anything) con Claude Code y le hice esas tres preguntas.

REA es un conjunto de herramientas de código abierto (licencia MIT) para que un agente inspeccione software sin tener su código fuente: binarios nativos, apps de Electron, APK de Android, WebAssembly y páginas web. Funciona como línea de comandos y como servidor MCP. El repositorio oficial es `morluto/rea` y el paquete de npm, `rea-agents`; hay varias webs con nombres parecidos que no son del proyecto. Uso la versión 6.8.0, la última en npm cuando escribo esto.

Cada respuesta de REA la comprobé por otro camino: un registro de red propio por el protocolo de DevTools y el panel de estadísticas del propio reproductor. Donde REA acierta lo digo, y donde no llega también.

## Lo que necesitas

- Node.js 24 (`npx` viene con él).
- Claude Code, si quieres usarlo desde el agente.
- Google Chrome.
- **Nada más.** Ghidra, IDA o Hopper solo hacen falta para binarios nativos. Para una web, REA trae todo lo que usa.

## Instala REA en Claude Code

`setup` te enseña primero lo que va a cambiar y después lo aplica. Fija la versión en cada comando, para que todo lo que hagas sea reproducible:

```bash
npx -y rea-agents@6.8.0 setup --client claude_code --dry-run
npx -y rea-agents@6.8.0 setup --client claude_code --yes
npx -y rea-agents@6.8.0 doctor --client claude_code
```

![El plan de setup, su aplicación y doctor en verde](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/rea-setup.png)

El plan tiene dos acciones: registrar el servidor MCP en `~/.claude.json` como `npx -y rea-agents@6.8.0 mcp` e instalar la skill de REA en `~/.claude/skills/`. Después, `doctor` da `healthy: true`. Te avisará de que faltan Ghidra, IDA, Hopper y JADX: son motores para otros tipos de objetivo y no afectan a lo que viene.

Yo lo hice con un `HOME` vacío, para no tocar mi configuración y ver lo mismo que verías tú desde cero. Si prefieres que REA solo exista en un proyecto, pon esto en su `.mcp.json`:

```json
{
  "mcpServers": {
    "rea": { "command": "npx", "args": ["-y", "rea-agents@6.8.0", "mcp"] }
  }
}
```

## Abre un Chrome que REA pueda observar

REA mira el navegador a través del protocolo de DevTools. Abre un Chrome con su propio perfil y el puerto de depuración escuchando solo en tu máquina:

```bash
google-chrome --remote-debugging-address=127.0.0.1 --remote-debugging-port=9333 \
  --user-data-dir="$(mktemp -d)" --mute-audio
```

Un perfil aparte importa: cualquiera que llegue a ese puerto controla el navegador, así que nunca uses el tuyo de siempre. Abre un vídeo y rechaza las cookies. Yo usé dos: «Me at the zoo» (el primer vídeo de YouTube, 19 segundos) y *Big Buck Bunny*, de la Blender Foundation (licencia CC BY), que dura lo bastante y tiene varias calidades.

Rechazar las cookies no es opcional: mientras el aviso está abierto, el vídeo se para a los 2 segundos y no hay nada que observar.

Con el navegador listo, REA ya lo ve:

```bash
npx -y rea-agents@6.8.0 list-browser-targets http://127.0.0.1:9333
```

## Pregunta 1: qué carga la página antes de que empiece el vídeo

La herramienta para esto es `capture-browser-scenario`: REA navega a la URL que le das, ejecuta los pasos que declaras y registra la red. Este es el escenario que usé:

```json
{
  "browser": { "mode": "connect", "cdp_endpoint": "http://127.0.0.1:9333", "target_id": "<el id de list-browser-targets>" },
  "start_url": { "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  "environment": { "service_workers": "allow" },
  "actions": [
    { "step_id": "player", "action": "wait_for", "locator": { "kind": "css", "selector": "#movie_player video" }, "state": "attached", "timeout_ms": 20000 },
    { "step_id": "watch", "action": "wait_for_timeout", "duration_ms": 25000 }
  ],
  "capture": { "at_end": ["url", "screenshot"], "events": ["network", "page-errors"] }
}
```

```bash
npx -y rea-agents@6.8.0 capture-browser-scenario scenario.json --format json > scenario-out.json
```

La línea `"service_workers": "allow"` no es decorativa. Sin ella, REA se niega: YouTube registra un *service worker* y, por defecto, REA no observa páginas controladas por uno. El error lo dice tal cual y te dice qué cambiar.

**Lo que vio REA.** 81 peticiones en 28 segundos (85 en 29 al repetirlo con un perfil limpio). Antes de la primera petición de vídeo, que sale al segundo 1,3, la página pide:

- el HTML de `/watch`;
- 17 miniaturas a `i.ytimg.com`;
- el reproductor (`/s/player/…/base.js`) y los módulos de la web;
- tres *polyfills* (`web-animations-next-lite`, `webcomponents-sd`, `intersection-observer`);
- las hojas de estilo y las fuentes.

Justo con la primera petición de vídeo llegan los módulos opcionales del reproductor: `offline.js`, `remote.js`, `miniplayer.js`, `captions.js`, `endscreen.js` y `annotations_module.js`.

**La comprobación.** En otra carga del mismo vídeo registré la red por mi cuenta, con el protocolo de DevTools. Salen las mismas rutas en el mismo orden, con diferencias de décimas de segundo; solo cambian unas pocas miniaturas de recomendaciones. Y un detalle que no esperaba: los 19 segundos de vídeo llegan enteros en **una sola petición `POST`** a `*.googlevideo.com/videoplayback`, de 480 KB.

**Cuánto pesa.** Con `analyze-web-bundle`, REA cuenta 50 scripts y 13,7 MB de JavaScript en la página. Dos se llevan casi todo: el núcleo de la web (9,7 MB) y el reproductor, `base.js` (2,6 MB). Los descargué aparte con `curl` y coinciden byte a byte, con el mismo hash; comprimidos, viajan 2 MB y 0,7 MB.

**Veredicto:** REA acierta. El inventario coincide con el del navegador.

## Pregunta 2: qué envía el navegador mientras ves el vídeo

Repetí el escenario con *Big Buck Bunny* y 90 segundos de reproducción, y lo comparé otra vez con mi registro. Coinciden petición a petición. Mientras ves el vídeo, el navegador hace esto:

| Petición | Cuándo, en la prueba |
| --- | --- |
| `POST *.googlevideo.com/videoplayback` | Cada 3 a 9 segundos, mientras se llena el búfer. Cada respuesta trae de 0,5 a 1,1 MB de vídeo, y cada petición lleva de 1,7 a 2 KB del navegador. |
| `POST /api/stats/watchtime` | Cada 10 segundos (a los 10, 20 y 30 s). |
| `POST /api/stats/qoe` | Al empezar y después cada 10 a 30 segundos. |
| `POST /api/stats/playback` y `GET /ptracking` | Una vez, al empezar. |
| `POST /api/stats/atr` | Una vez, a los 2 segundos. |
| `POST /youtubei/v1/log_event` | Un par de veces al cargar. |

A los 40 segundos, el reproductor ya tenía 55 segundos de vídeo descargados por delante.

**Lo que REA añade.** Con `observe-web-execution`, REA da la pila de llamadas de cada petición. El informe `qoe` sale del reproductor, de una función llamada `reportStats` en `base.js`. El de `watchtime` sale del núcleo de la web, de `sendThenWrite`. En esa captura, hecha mientras liberaba la conexión en la pregunta 3, las URLs de los dos llevaban `fmt=397` y `afmt=251`. Son los mismos identificadores que el panel «Estadísticas avanzadas» del reproductor (clic derecho sobre el vídeo) muestra junto a los códecs: `av01 (397)` a 480p, `av01 (394)` a 144p y `opus (251)` para el audio.

**Veredicto:** REA acierta, y la pila de llamadas aporta algo que la pestaña de red no te da de un vistazo.

## Pregunta 3: cómo elige la calidad

Esta era la difícil. Para provocar el cambio, limité la conexión a 300 kbit/s con el protocolo de DevTools (`Network.emulateNetworkConditions`) antes de abrir el vídeo. A mitad de la prueba la liberé.

![Resolución en pantalla durante la prueba: 480p, 144p con la conexión limitada y 480p de nuevo 22 segundos después de liberarla](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/chart-quality-es.png)

Esto es lo que midió el navegador, muestreando la resolución cada 2 segundos:

1. **Con la conexión limitada**, los primeros 2 segundos se ven a 480p. A los 6 segundos de vídeo el reproductor baja a 144p.
2. **Al liberar la conexión**, el reproductor pasa *en ese mismo instante* a pedir 480p, y su búfer salta de 22 a 59 segundos.
3. **Pero la imagen sigue en 144p** hasta que se reproduce lo que ya había descargado. En esta prueba tardó 22 segundos. En otra, 16. En una tercera seguía en 144p a los 32 segundos, cuando terminó la prueba.

![Estadísticas avanzadas con la conexión limitada: resolución actual 256x144, óptima 854x480, 139 kbps. Big Buck Bunny © Blender Foundation, CC BY 3.0](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/youtube-throttled.png)

![Estadísticas avanzadas tras liberar la conexión: 854x480, 12.511 kbps y 60 segundos de búfer. Big Buck Bunny © Blender Foundation, CC BY 3.0](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/youtube-released.png)

El panel lo confirma: `256x144` frente a una óptima de `854x480` con 139 kbps, y después `854x480` con 12.511 kbps y 60 segundos de búfer. En su línea «Mystery Text» aparece «SABR», y el vídeo llega en peticiones `POST` que llevan de 1,7 a 2 KB del navegador cada una.

Y un experimento previo, a la inversa: si limitas la conexión *después* de llenar el búfer, la calidad no baja. Con 55 segundos ya descargados, el resto de la prueba (más de 40 segundos) se reprodujo a 480p.

**Lo que hizo REA.** Le pedí dónde está esa decisión en el código, y no llegó.

- **`analyze-web-bundle`** analiza el JavaScript sin ejecutarlo. Con su configuración por defecto (30 segundos por script), se le agotó el tiempo justo en los dos scripts que importan: el reproductor y el núcleo de la web, 12,4 de los 13,7 MB. Lo repetí con 10 minutos por script y 6 GB de memoria: 20 minutos y 4,6 GB después, el mismo resultado.
- **`observe-web-execution`** mide qué funciones se ejecutan durante una ventana de tiempo. Lo lancé unos segundos antes de liberar la conexión, con una ventana de 15 segundos: en ese tiempo se ejecutaron 1.022 funciones del reproductor. Casi todas tienen nombres minificados (`uHa`, `pz`, `Dz`…). Lo único legible son APIs del navegador, como `appendBuffer`, que mete los trozos de vídeo en el búfer, y `getPlaybackQuality`.

![analyze-web-bundle sobre YouTube: los dos scripts grandes se quedan sin analizar con 30 segundos y con 10 minutos por script](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/rea-bundle.png)

**Veredicto:** REA no encontró dónde se decide la calidad. Lo que sé de la pregunta 3 lo midió el navegador.

## Úsalo desde Claude Code

Con el servidor MCP registrado, se lo pides a Claude Code en lenguaje natural. Lo probé tres veces con `claude -p` y el resultado dependió mucho del prompt:

1. **Prompt sin nombrar la herramienta**, con un máximo de 12 turnos. Claude usó `inspect_web_page`, pero la respuesta de REA ocupaba 1,17 millones de caracteres. Supera el límite de salida de una herramienta MCP en Claude Code, que la guarda en un fichero, y el agente gastó los 12 turnos leyéndolo sin llegar a responder. Por el camino intentó pasar `https://*.googlevideo.com` como origen permitido, y REA lo rechazó: solo admite orígenes exactos, y los servidores de vídeo cambian de nombre en cada sesión.
2. **El mismo prompt, otra vez.** Esta vez eligió `observe_web_session`, que solo registra la navegación de la página y no sus peticiones. Contestó, con razón, que no podía decirme nada.
3. **Prompt que nombra la herramienta**, sus parámetros y que lea el fichero con `jq`. Siete turnos y 50 segundos.

![Claude Code con REA: la respuesta separa lo observado de su interpretación](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/rea-claude.png)

En esos 10 segundos, la página no hizo ninguna petición a `www.youtube.com`. REA filtró 3 a otros orígenes porque no estaban permitidos, y Claude lo dice así, separando lo observado de su interpretación. La lección: dile qué herramienta usar y qué orígenes, y prepárate para leer resultados grandes desde fichero.

## Qué acierta REA y qué no

- **Acierta** en el inventario de red: coincidió petición a petición con mi registro en todas las pruebas.
- **Aporta** la pila de llamadas de cada petición, que te dice qué script y qué función la envió.
- **Avisa bien.** Cada salida trae sus límites, por ejemplo que la observación empieza cuando se conecta o qué peticiones filtró por su origen, y sus errores dicen qué cambiar.
- **No llega** al análisis estático de un bundle como el de YouTube: los dos scripts que importan se quedan sin analizar, incluso con 10 minutos por script.
- **No da nombres útiles** en código minificado: sabe qué funciones se ejecutaron, no qué hacen.
- **Exige criterio al agente.** Elegir la herramienta equivocada (solo navegación) o pedir un resultado de un millón de caracteres son errores fáciles.

## Repítelo

Con Chrome abierto como arriba y un vídeo en marcha:

```bash
npx -y rea-agents@6.8.0 setup --client claude_code --yes
npx -y rea-agents@6.8.0 doctor --client claude_code
npx -y rea-agents@6.8.0 list-browser-targets http://127.0.0.1:9333
npx -y rea-agents@6.8.0 capture-browser-scenario scenario.json --format json > scenario-out.json
npx -y rea-agents@6.8.0 observe-web-execution http://127.0.0.1:9333 <target_id> --observation-ms 15000 --format json > execution.json
npx -y rea-agents@6.8.0 analyze-web-bundle http://127.0.0.1:9333 <target_id> --observation-ms 3000 --format json > bundle.json
```

Las salidas son JSON grandes; `jq` es tu amigo. Por ejemplo, `jq '.normalized_result.events.items | length' scenario-out.json` cuenta los eventos de red.

## Límites

Todo esto es observar lo que tu navegador ya descarga y ya envía, lo mismo que verías en las DevTools, y explicarlo. No toqué la sesión de nadie, ni los anuncios, ni las protecciones del vídeo, ni descargué vídeos. Si analizas una web, respeta sus condiciones de uso.
