# Memotest

# Temática elegida:
Se optó por un sistema de memotest genérico, gracias a la implementación de una pseudo-base de datos con una arquitectura que permite generar nuevas barajas de cartas para jugar al Memotest, es posible elegir las imagenes del set que se quiera jugar.

## Sistema de puntaje

El puntaje de la partida es dinámico y recompensa la velocidad y la precisión del jugador mediante una bonificación por racha (combo).

### Cálculo de puntos por acierto
Cada acierto consecutivo (a partir del segundo acierto en adelante) suma una unidad a la racha actual ($\text{actualStreak}$). La ganancia de puntos en un acierto se calcula mediante la fórmula:

$$\text{Puntos Obtenidos} = P_{\text{acierto}} + \left( P_{\text{acierto}} \times M_{\text{racha}} \times (\text{actualStreak} - 1) \right)$$

**Donde:**
* $P_{\text{acierto}}$: Puntos base por acierto según la dificultad.
* $M_{\text{racha}}$: Porcentaje o multiplicador por racha según la dificultad.
* $\text{actualStreak}$: Cantidad de aciertos consecutivos actuales.

### Ejemplo práctico (suponiendo $P_{\text{acierto}} = 100$ pts y $M_{\text{racha}} = 0.10$ / 10%):
* **Acierto 1** ($\text{racha} = 1$): $100 + (100 \times 0.10 \times 0) = \mathbf{+100\text{ pts}}$
* **Acierto 2** ($\text{racha} = 2$): $100 + (100 \times 0.10 \times 1) = \mathbf{+110\text{ pts}}$
* **Acierto 3** ($\text{racha} = 3$): $100 + (100 \times 0.10 \times 2) = \mathbf{+120\text{ pts}}$

### Penalizaciones
* **Por error:** Si las cartas seleccionadas no coinciden, la racha se reinicia a $0$ y se descuenta una cantidad fija de puntos ($P_{\text{error}}$). El puntaje nunca puede ser menor a $0$.
* **Pasiva por tiempo:** Con cada segundo transcurrido en el temporizador, se descuenta de forma pasiva una cantidad determinada de puntos ($P_{\text{segundo}}$).
## Funcionalidades implementadas

* **Autenticación (Login / Logout):** Registro e inicio de sesión por nombre de usuario.
* **Pre-inicio de partida:** Configuración de la partida (selección de baraja, dificultad y modo progresivo).
* **Partida en tiempo real:** Control de turnos, temporizador descendente, volteo temporal de cartas al iniciar y barra HUD de estadísticas.
* **Modo Progresivo:** Avance automático al siguiente nivel de dificultad tras ganar la partida, manteniendo las estadísticas acumuladas sin recargar la página.
* **Pantalla Final:** Desglose detallado de estadísticas finales (tiempo, aciertos, fallos, racha máxima, intentos) tras una victoria o derrota.
* **Gestión de Barajas:** Visualización y creación de nuevas barajas dinámicas mediante subida/carga de imágenes.
* **Ranking / Historial:** Modal interactivo para consultar, ordenar y filtrar el historial de partidas registradas.
* **Tema Visual (Claro / Oscuro):** Soporte para cambio de tema visual en toda la aplicación.

# Link a Github Pages: 
Se puede visitar la página oficial de la aplicación en [Github Pages](https://francofelg.github.io/memotest/index.html)

# Integrantes del proyecto:
- Ciolfi Lucas
- Gonzalvez Rolón Federico
- Lamberti Franco