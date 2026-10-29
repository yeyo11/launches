# LinkedIn

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Trabajando con varios agentes de IA en paralelo, mi máquina se pasaba el día ejecutando los mismos tests y builds una y otra vez, hasta quedarse sin memoria.

He publicado Sluice, que pone en una sola cola los tests, builds y comandos pesados de todos los agentes de una máquina Linux.

Lo construí porque la máquina acababa bloqueada: GNOME sin responder y el OOM killer matando procesos.

Lo que hace hoy:

- Ejecuta cada gate (tests, linters, type checks) una sola vez por árbol de git y guarda el resultado. En mis dos equipos, unas 28 horas de verificaciones que no se ejecutaron en una semana.
- Reparte un presupuesto común de CPU y memoria, con cada trabajo en su propio cgroup. Desde la 0.6.0, 0 episodios de falta de memoria en el segundo equipo en 2,5 días medidos.
- Hace backfilling: la espera por minuto de trabajo bajó unas 4 veces en mi medición.
- Marca como STALLED los trabajos colgados, sin matarlos.
- Puede ser el punto de entrada de los hooks de husky sin tocar el repositorio.

Es de código abierto (MIT), está escrito en Rust y funciona con cualquier agente que soporte MCP, con un plugin para Claude Code.

En el artículo explico cómo se instala y los números medidos.

#Rust #ClaudeCode #DevTools
