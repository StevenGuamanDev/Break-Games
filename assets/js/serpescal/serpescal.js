// Constantes del juego
const NUMERO_CASILLAS = 100;
const escaleras = [
    { inicio: 1, fin: 38 },
    { inicio: 4, fin: 14 },
    { inicio: 9, fin: 31 },
    { inicio: 21, fin: 42 },
    { inicio: 28, fin: 84 },
    { inicio: 51, fin: 67 },
    { inicio: 72, fin: 91 },
    { inicio: 80, fin: 99 }
];
const serpientes = [
    { inicio: 17, fin: 7 },
    { inicio: 54, fin: 34 },
    { inicio: 62, fin: 19 },
    { inicio: 64, fin: 60 },
    { inicio: 87, fin: 24 },
    { inicio: 92, fin: 63 },
    { inicio: 95, fin: 75 },
    { inicio: 98, fin: 79 }
];
const jugador1 = 'Jugador 1';
const jugador2 = 'Jugador 2';

let turno = jugador1;
let posicionJugador1 = 0;
let posicionJugador2 = 0;

// Elementos del DOM
const tablero = document.getElementById('tablero');
const btnLanzarDado = document.getElementById('btn-lanzar-dado');
const btnLanzarDado1 = document.getElementById('btn-lanzar-dado1');
const jugadorTurnoElem = document.getElementById('turno');
const dice = document.getElementById('dice');
const dice1 = document.getElementById('dice1');
const diceSound = document.getElementById('dice-sound');
const moveSound = document.getElementById('move-sound'); // Agregar referencia al sonido de movimiento
const serpienteSound = document.getElementById('serpiente-sound'); // Agregar referencia al sonido de la serpiente
const escaleraSound = document.getElementById('escalera-sound'); // Agregar referencia al sonido de la escalera
const winSound = document.getElementById('win-sound'); // Agregar referencia al sonido de la serpiente
const loseSound = document.getElementById('lose-sound'); // Agregar referencia al sonido de la escalera
const mensajeResultado = document.getElementById('mensaje-resultado');

// Inicialización del juego
document.addEventListener('DOMContentLoaded', crearTablero);
btnLanzarDado.addEventListener('click', () => lanzarDado(dice));
btnLanzarDado1.addEventListener('click', () => lanzarDado(dice1));

function crearTablero() {
    let casillas = '';
    let casillaNumerada = NUMERO_CASILLAS;

    for (let fila = 0; fila < 10; fila++) {
        if (fila % 2 === 0) {
            for (let columna = 0; columna < 10; columna++) {
                casillas += `
              <div id="casilla-${casillaNumerada}" class="casilla">
                  ${casillaNumerada}
                  <div class="jugador-contenedor"></div> <!-- Contenedor para los jugadores -->
              </div>`;
                casillaNumerada--;
            }
        } else {
            let inicioFila = casillaNumerada - 9;
            for (let columna = 0; columna < 10; columna++) {
                casillas += `
              <div id="casilla-${inicioFila + columna}" class="casilla">
                  ${inicioFila + columna}
                  <div class="jugador-contenedor"></div> <!-- Contenedor para los jugadores -->
              </div>`;
            }
            casillaNumerada -= 10;
        }
    }

    tablero.innerHTML = casillas;
    colocarEscalerasYSerpientes();
}


function colocarEscalerasYSerpientes() {
    escaleras.forEach(escalera => {
        const casillaInicio = document.getElementById(`casilla-${escalera.inicio}`);
        if (!casillaInicio.querySelector('.escalera-content')) { // Asegurarse de no duplicar
            casillaInicio.classList.add('escalera');
            casillaInicio.innerHTML += `
          <div class="escalera-content">
              <i class="fas fa-arrow-up"></i>
              <div>${escalera.fin}</div>
          </div>`;
        }
    });

    serpientes.forEach(serpiente => {
        const casillaInicio = document.getElementById(`casilla-${serpiente.inicio}`);
        if (!casillaInicio.querySelector('.serpiente-content')) { // Asegurarse de no duplicar
            casillaInicio.classList.add('serpiente');
            casillaInicio.innerHTML += `
          <div class="serpiente-content">
              <i class="fas fa-arrow-down"></i>
              <div>${serpiente.fin}</div>
          </div>`;
        }
    });
}


function lanzarDado(diceElement) {
    diceSound.currentTime = 0;
    diceSound.play();

    const result = Math.floor(Math.random() * 6) + 1;

    // Aplica la rotación al dado actual
    diceElement.style.transform = 'rotateX(360deg) rotateY(360deg)';
    diceElement.addEventListener('transitionend', () => {
        diceElement.style.transition = 'none';
        diceElement.style.transform = '';
        diceElement.offsetHeight;  // Reflujo para aplicar la transición de nuevo
        diceElement.style.transition = 'transform 0.5s ease-in-out';
        diceElement.innerHTML = ''; // Limpia el contenido del dado
        addDots(result, diceElement); // Añade los puntos según el resultado
        avanzar(result); // Acción adicional según el resultado
    }, { once: true });
}


function addDots(number, diceElement) {
    const positions = {
        1: [['50%', '50%']],
        2: [['30%', '30%'], ['70%', '70%']],
        3: [['30%', '30%'], ['50%', '50%'], ['70%', '70%']],
        4: [['30%', '30%'], ['30%', '70%'], ['70%', '30%'], ['70%', '70%']],
        5: [['30%', '30%'], ['30%', '70%'], ['50%', '50%'], ['70%', '30%'], ['70%', '70%']],
        6: [['20%', '30%'], ['20%', '50%'], ['20%', '70%'], ['80%', '30%'], ['80%', '50%'], ['80%', '70%']]
    };

    // Limpiar cualquier punto anterior antes de añadir nuevos
    diceElement.innerHTML = '';

    // Añadir los puntos según el número lanzado
    positions[number].forEach(([top, left]) => {
        const dot = document.createElement('div');
        dot.classList.add('absolute', 'w-4', 'h-4', 'bg-black', 'rounded-full');
        dot.style.top = top;
        dot.style.left = left;
        dot.style.transform = 'translate(-50%, -50%)';
        diceElement.appendChild(dot);
    });
}


// function avanzar(numeroCasillas) {
//     const posicionAnterior = turno === jugador1 ? posicionJugador1 : posicionJugador2;
//     let nuevaPosicion = Math.min(posicionAnterior + numeroCasillas, NUMERO_CASILLAS);

//     moverFichasPasoAPaso(posicionAnterior, nuevaPosicion).then(() => {
//         verificarCasilla(nuevaPosicion);
//         cambiarTurno(); // Aquí se actualiza el turno y el sombreado

//         // Actualizar el sombreado después de cambiar el turno
//         actualizarSombreado(turno);

//         if (posicionJugador1 === NUMERO_CASILLAS) {
//             winSound.currentTime = 0;
//             winSound.play();
//             Swal.fire({
//                 title: '¡Ganador!',
//                 text: `${jugador1} ha ganado!`,
//                 icon: 'success',
//                 confirmButtonText: 'OK'
//             }).then((result) => {
//                 if (result.isConfirmed) {
//                     window.location.href = "serpescal.html";
//                 }
//             });
//             deshabilitarBotonLanzarDado();
//         } else if (posicionJugador2 === NUMERO_CASILLAS) {
//             loseSound.currentTime = 0;
//             loseSound.play();
//             Swal.fire({
//                 title: '¡Ganador!',
//                 text: `${jugador2} Te ha ganado!`,
//                 icon: 'error',
//                 confirmButtonText: 'OK'
//             }).then((result) => {
//                 if (result.isConfirmed) {
//                     window.location.href = "serpescal.html";
//                 }
//             });
//             deshabilitarBotonLanzarDado();
//         }
//     });

//     // Actualiza la posición final al terminar el intervalo
//     if (turno === jugador1) {
//         posicionJugador1 = nuevaPosicion;
//     } else {
//         posicionJugador2 = nuevaPosicion;
//     }
// }


function actualizarSombreado(turno) {
    // Elimina la clase de sombreado de ambos iconos
    document.getElementById('iconoUsuario').classList.remove('sombreado-activado');
    document.getElementById('iconoRobot').classList.remove('sombreado-activado');
    document.getElementById('iconoUsuario1').classList.remove('sombreado-activado');
    document.getElementById('iconoRobot1').classList.remove('sombreado-activado');

    // Añade la clase de sombreado al icono correspondiente según el turno
    if (turno === jugador1) {
        document.getElementById('iconoUsuario').classList.add('sombreado-activado');
        document.getElementById('iconoUsuario1').classList.add('sombreado-activado');
    } else if (turno === jugador2) {
        document.getElementById('iconoRobot').classList.add('sombreado-activado');
        document.getElementById('iconoRobot1').classList.add('sombreado-activado');
    }
}

// Llama a la función actualizarSombreado en el momento adecuado
// Por ejemplo, después de cambiar el turno:
function cambiarTurno() {
    // Lógica para cambiar el turno...
    // Por ejemplo:
    turno = turno === jugador1 ? jugador2 : jugador1;
    actualizarSombreado(turno);
}

// Variable para verificar si el turno está en proceso de movimiento
let turnoEnMovimiento = false;

function moverFichasPasoAPaso(posicionAnterior, nuevaPosicion) {
    return new Promise((resolve) => {
        let posicionActual = posicionAnterior;
        const paso = 1; // Número de casillas que se moverá en cada intervalo
        const intervalo = 200; // Tiempo en milisegundos para cada paso de la animación

        // Deshabilitar el botón de lanzar dado antes de mover
        btnLanzarDado.disabled = true;
        btnLanzarDado1.disabled = true;

        // Establecer que el turno está en movimiento
        turnoEnMovimiento = true;

        // Define el intervalo para el movimiento paso a paso
        const movimiento = setInterval(() => {
            posicionActual += paso;
            if (posicionActual > nuevaPosicion) {
                posicionActual = nuevaPosicion;
                clearInterval(movimiento);
                resolve(); // Resuelve la promesa cuando el movimiento termina
            }
            playMoveSound();
            moverJugador('#casilla-', posicionActual - paso, posicionActual);

        }, intervalo);
    });
}

function avanzar(numeroCasillas) {
    // Verificar si el turno está en movimiento (si el jugador ya está moviendo su ficha)
    if (turnoEnMovimiento) {
        Swal.fire({
            title: 'Espera!',
            text: '¡Espera a que termine el turno del otro Jugador!',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return; // No hacer nada más si el turno está en movimiento
    }

    const posicionAnterior = turno === jugador1 ? posicionJugador1 : posicionJugador2;
    let nuevaPosicion = Math.min(posicionAnterior + numeroCasillas, NUMERO_CASILLAS);

    moverFichasPasoAPaso(posicionAnterior, nuevaPosicion).then(() => {
        verificarCasilla(nuevaPosicion);
        cambiarTurno(); // Aquí se actualiza el turno y el sombreado

        // Actualizar el sombreado después de cambiar el turno
        actualizarSombreado(turno);

        if (posicionJugador1 === NUMERO_CASILLAS) {
            winSound.currentTime = 0;
            winSound.play();
            Swal.fire({
                title: '¡Ganador!',
                text: `¡Ha ganado el ${jugador1}!`,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "serpescal.html";
                }
            });
            deshabilitarBotonLanzarDado();
        } else if (posicionJugador2 === NUMERO_CASILLAS) {
            winSound.currentTime = 0;
            winSound.play();
            Swal.fire({
                title: '¡Ganador!',
                text: `¡Ha ganado el ${jugador2}!`,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "serpescal.html";
                }
            });
            deshabilitarBotonLanzarDado();
        }

        // Habilitar el botón de lanzar dado después de cambiar el turno
        btnLanzarDado.disabled = false;
        btnLanzarDado1.disabled = false;

        // Establecer que el turno ya no está en movimiento
        turnoEnMovimiento = false;
    });

    // Actualiza la posición final al terminar el intervalo
    if (turno === jugador1) {
        posicionJugador1 = nuevaPosicion;
    } else {
        posicionJugador2 = nuevaPosicion;
    }
}


function playMoveSound() {
    // Configura el sonido para reproducirse desde el inicio
    moveSound.currentTime = 0;
    moveSound.play();
}


function verificarCasilla(posicion) {
    escaleras.forEach(escalera => {
        if (posicion === escalera.inicio) {
            escaleraSound.currentTime = 0; // Reproduce el sonido de la escalera
            escaleraSound.play();
            subirBajarJugador(escalera.fin);
        }
    });

    serpientes.forEach(serpiente => {
        if (posicion === serpiente.inicio) {
            serpienteSound.currentTime = 0; // Reproduce el sonido de la serpiente
            serpienteSound.play();
            subirBajarJugador(serpiente.fin);
        }
    });
}

function subirBajarJugador(destino) {
    const casillaDestino = document.getElementById(`casilla-${destino}`);

    // Solo movemos al jugador sin añadir texto extra
    if (turno === jugador1) {
        moverJugador('#casilla-', posicionJugador1, destino);
        posicionJugador1 = destino;
    } else {
        moverJugador('#casilla-', posicionJugador2, destino);
        posicionJugador2 = destino;
    }
}

function moverJugador(selector, origen, destino) {
    // Limpiar el ícono del jugador en la casilla de origen
    if (origen !== 0) {
        const casillaOrigen = document.querySelector(`${selector}${origen}`);
        const iconoJugador = casillaOrigen.querySelector('.icono-jugador');
        if (iconoJugador) {
            iconoJugador.remove(); // Eliminar el ícono del jugador sin tocar el contenido original
        }
        casillaOrigen.classList.remove('jugador1', 'jugador2');  // Remover las clases del jugador
    }

    // Asegúrate de que el contenedor tenga posición relativa
    const casillaDestino = document.querySelector(`${selector}${destino}`);
    casillaDestino.style.position = 'relative';

    // Colocar el jugador en la casilla de destino sin eliminar las fichas previas
    if (turno === jugador1) {
        // Verificar si ya hay una ficha de jugador1
        const fichaJugador1 = casillaDestino.querySelector('.icono-jugador.jugador1');
        if (!fichaJugador1) {
            casillaDestino.insertAdjacentHTML('beforeend', `<i class="fa-solid fa-user icono-jugador jugador1 mb-2 text-2xl text-blue-500 absolute z-50"></i>`);
        }
    } else {
        // Verificar si ya hay una ficha de jugador2
        const fichaJugador2 = casillaDestino.querySelector('.icono-jugador.jugador2');
        if (!fichaJugador2) {
            casillaDestino.insertAdjacentHTML('beforeend', `<i class="fa-solid fa-robot icono-jugador jugador2 mb-2 text-2xl text-red-500 absolute z-50"></i>`);
        }
    }
}




function cambiarTurno() {
    turno = turno === jugador1 ? jugador2 : jugador1;
    console.log('Prueba'.turno);
}


function deshabilitarBotonLanzarDado() {
    btnLanzarDado.disabled = true;
    btnLanzarDado1.disabled = true;
}

function iniciarJuego() {
    posicionJugador1 = 0;
    posicionJugador2 = 0;
    turno = jugador1;
    jugadorTurnoElem.textContent = `${turno} es el turno`;
    btnLanzarDado.disabled = false;
    btnLanzarDado1.disabled = false;
    mensajeResultado.textContent = '';
    crearTablero();
}

function reiniciarJuego(event) {
    event.preventDefault();
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Deseas reiniciar el juego!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, Reiniciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "serpescal.html";
        }
    });
}