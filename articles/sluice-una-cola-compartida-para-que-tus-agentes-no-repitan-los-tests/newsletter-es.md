# Newsletter (es)

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Subject: De agentes peleándose por la máquina a cero caídas: así funciona Sluice
Preview: Cada gate se ejecuta una vez por árbol de git, con un presupuesto común de CPU y memoria. Unas 28 horas de checks ahorradas en una semana.

Hola:

Trabajando con varios agentes de IA en paralelo, mi máquina se pasaba el día ejecutando los mismos tests y builds una y otra vez, hasta quedarse sin memoria. Por eso hice Sluice, que acabo de publicar como código abierto.

Sluice pone en una sola cola los tests, builds y comandos pesados de todos los agentes de una máquina Linux. Cada gate se ejecuta una sola vez por árbol de git, bajo un presupuesto común de CPU y memoria. En mis dos equipos fueron unas 28 horas de tests y linters que no se ejecutaron en una semana.

En el artículo cuento cómo se conecta a tu agente (Claude Code o cualquier otro que soporte MCP), cómo evita quedarse sin memoria, cómo con el backfilling la espera por minuto de trabajo bajó unas 4 veces en mi medición y cómo funciona con hooks de husky que no puedes tocar. Te enseño los números y cómo los medí.

[Lee el artículo](https://josegarrido.dev/es/sluice-una-cola-compartida-para-que-tus-agentes-no-repitan-los-tests/?ref=newsletter)

José Antonio
