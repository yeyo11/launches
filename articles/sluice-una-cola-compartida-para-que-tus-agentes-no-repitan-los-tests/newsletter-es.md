# Newsletter (es)

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Subject: De agentes peleándose por la máquina a cero caídas: así funciona Sluice
Preview: Cada gate se ejecuta una vez por árbol de git, con un presupuesto común de CPU y memoria. Unas 28 horas de checks ahorradas en una semana.

Hola:

Acabo de publicar Sluice, una herramienta de código abierto que hice porque tener muchos agentes de IA en una máquina la bloqueaba, y los mismos tests se repetían sobre código que ya había pasado.

Sluice es una cola y una caché de verificación compartidas por todos los agentes de una máquina Linux. Cada gate se ejecuta una sola vez por árbol de git, bajo un presupuesto común de CPU y memoria. En mis dos equipos fueron unas 28 horas de tests y linters que no se ejecutaron en una semana.

En el artículo cuento cómo se conecta a tu agente (Claude Code o cualquier otro que soporte MCP), cómo evita quedarse sin memoria, cómo el backfilling bajó la espera por minuto de trabajo de 1,92 a 0,44 min y cómo funciona con hooks de husky que no puedes tocar. Te enseño los números y cómo los medí.

[Lee el artículo](https://josegarrido.dev/es/sluice-una-cola-compartida-para-que-tus-agentes-no-repitan-los-tests/?ref=newsletter)

José Antonio
