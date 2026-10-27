# LinkedIn

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Le pedí a un agente que me explicara qué hace el reproductor de YouTube cuando le das al play. Después comprobé cada respuesta por mi cuenta.

Monté REA (Reverse Engineer Anything), herramientas de código abierto (MIT) para que un agente inspeccione software sin su código fuente, y lo usé desde Claude Code contra YouTube. Contrasté cada respuesta con mi propio registro de red y con el panel de estadísticas del reproductor.

Lo que acertó:
- Su inventario de red coincidió con mi registro petición a petición: 81 peticiones en 28 segundos, y los 19 segundos de vídeo llegan en una sola petición POST.
- observe-web-execution da la pila de llamadas de cada petición: sabes qué script y qué función la envió.

Lo que no:
- analyze-web-bundle dejó sin analizar los dos scripts que importan (12,4 de 13,7 MB), incluso con 10 minutos por script.
- Así que REA no encontró dónde se decide la calidad. Eso lo saqué del navegador.

Desde Claude Code, el prompt importa: una vez leyó un resultado de 1,17 millones de caracteres durante 12 turnos sin responder; otra eligió una herramienta que solo registra la navegación. Nombrar la herramienta y los orígenes lo arregló.

En el artículo tienes los comandos, el fichero del escenario y las cifras.

#ClaudeCode #MCP #IngenieríaInversa
