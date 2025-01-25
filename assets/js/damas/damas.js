const tamañoTablero = 8;
let tablero = [];
let turno = 'blanco'; // Comienza con el turno de las fichas blancas
let seleccionada = null;
let temporizadorJugadorBlanco;
let temporizadorJugadorNegro;
let tiempoBlanco = 0;
let tiempoNegro = 0;
let tiempoInicioTurno;

// Carga de los sonidos
const sonidoMovimiento = new Audio('../../sonidos/damas/mover.mp3');
const sonidoCaptura = new Audio('../../sonidos/damas/capturar.mp3');
const sonidoVictoriaBlanco = new Audio('../../sonidos/damas/ganar.mp3');
const sonidoVictoriaNegro = new Audio('../../sonidos/damas/perder.mp3');
const sonidoCoronacion = new Audio('../../sonidos/damas/dama.mp3'); // Sonido para la coronación de una dama

document.addEventListener('DOMContentLoaded', () => {
    reiniciarDamas();
    actualizarIconos(); // Actualiza los iconos al iniciar el juego
});

function reiniciarDamas() {
    tablero = crearTablero();
    colocarPiezas(tablero);
    actualizarPantalla();
    tiempoBlanco = 0;
    tiempoNegro = 0;
    document.getElementById('cronometroPlayer').textContent = formatTiempo(tiempoBlanco);
    document.getElementById('cronometroRobot').textContent = formatTiempo(tiempoNegro);
    document.getElementById('cronometroPlayer1').textContent = formatTiempo(tiempoBlanco);
    document.getElementById('cronometroRobot1').textContent = formatTiempo(tiempoNegro);
    detenerTemporizadores(); // Detiene ambos temporizadores al reiniciar el juego
    iniciarTemporizador(); // Inicia el temporizador del jugador que comienza
}

function crearTablero() {
    const tablero = [];
    for (let i = 0; i < tamañoTablero; i++) {
        const fila = [];
        for (let j = 0; j < tamañoTablero; j++) {
            fila.push(null);
        }
        tablero.push(fila);
    }
    return tablero;
}

function colocarPiezas(tablero) {
    // Colocar fichas negras en la parte superior
    for (let i = 0; i < 3; i++) {
        for (let j = (i % 2); j < tamañoTablero; j += 2) {
            tablero[i][j] = { color: 'negro', esDama: false };
        }
    }
    // Colocar fichas blancas en la parte inferior
    for (let i = tamañoTablero - 1; i > tamañoTablero - 4; i--) {
        for (let j = (i % 2); j < tamañoTablero; j += 2) {
            tablero[i][j] = { color: 'blanco', esDama: false };
        }
    }
}

function actualizarPantalla() {
    const tableroElem = document.querySelector('.tablero-damas');
    tableroElem.innerHTML = '';
    tablero.forEach((fila, i) => {
        fila.forEach((celda, j) => {
            const celdaElem = document.createElement('div');
            celdaElem.classList.add('celda', (i + j) % 2 === 0 ? 'blanco' : 'negro');
            if (celda) {
                const piezaElem = document.createElement('div');
                piezaElem.classList.add('pieza', celda.color);
                // Agregar la corona si es una dama
                if (celda.esDama) {
                    const corona = document.createElement('i');
                    corona.classList.add('fas', 'fa-chess-queen', 'corona');
                    piezaElem.appendChild(corona);
                }
                piezaElem.addEventListener('click', () => seleccionarPieza(i, j));
                celdaElem.appendChild(piezaElem);
            } else {
                celdaElem.addEventListener('click', () => moverPieza(i, j));
            }
            tableroElem.appendChild(celdaElem);
        });
    });
}

function seleccionarPieza(i, j) {
    if (tablero[i][j] && tablero[i][j].color === turno) {
        seleccionada = { i, j };
        actualizarPantalla();
        const opciones = mostrarOpciones(i, j);
        resaltarOpciones(opciones);
    }
}

function esMovimientoValido(si, sj, i, j) {
    if (i < 0 || i >= tamañoTablero || j < 0 || j >= tamañoTablero) {
        return false;
    }

    const dx = i - si;
    const dy = j - sj;
    const pieza = tablero[si][sj];
    const esDama = pieza.esDama;

    // Movimiento simple a una celda vacía
    if (Math.abs(dx) === 1 && Math.abs(dy) === 1 && tablero[i][j] === null) {
        if (esDama || (pieza.color === 'blanco' && dx < 0) || (pieza.color === 'negro' && dx > 0)) {
            return true;
        }
    }

    // Movimiento de captura
    if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
        const capturaX = si + dx / 2;
        const capturaY = sj + dy / 2;

        if (
            capturaX >= 0 && capturaX < tamañoTablero &&
            capturaY >= 0 && capturaY < tamañoTablero &&
            tablero[capturaX][capturaY] && tablero[capturaX][capturaY].color !== turno
        ) {
            if (esDama || (pieza.color === 'blanco' && dx < 0) || (pieza.color === 'negro' && dx > 0)) {
                return true;
            }
        }
    }

    return false;
}

function moverPieza(i, j) {
    if (seleccionada) {
        const { i: si, j: sj } = seleccionada;
        if (esMovimientoValido(si, sj, i, j)) {
            tablero[i][j] = tablero[si][sj];
            tablero[si][sj] = null;

            const dx = i - si;
            const dy = j - sj;

            if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
                const capturaX = si + dx / 2;
                const capturaY = sj + dy / 2;
                tablero[capturaX][capturaY] = null;
                sonidoCaptura.play();
            } else {
                sonidoMovimiento.play();
            }

            coronarPieza(i, j);

            seleccionada = null;
            turno = turno === 'blanco' ? 'negro' : 'blanco';
            actualizarPantalla();
            actualizarIconos(); // Actualiza los iconos después de cambiar el turno

            detenerTemporizadores(); // Detiene los temporizadores antes de iniciar el nuevo
            iniciarTemporizador(); // Inicia el temporizador del siguiente jugador

            if (turno === 'negro') {
                setTimeout(movimientoComputadora, 1000); // Mueve el computador después de 1 segundo
            }

            // Verificar si hay ganador
            if (verificarGanador()) {
                manejarVictoria();
            }
        }
    }
}

function mostrarOpciones(i, j) {
    const opciones = [];
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
            const nuevoI = i + dx;
            const nuevoJ = j + dy;
            if (esMovimientoValido(i, j, nuevoI, nuevoJ)) {
                opciones.push({ i: nuevoI, j: nuevoJ });
            }
        }
    }
    return opciones;
}

function resaltarOpciones(opciones) {
    const celdas = document.querySelectorAll('.tablero-damas .celda');
    celdas.forEach(celda => celda.classList.remove('resaltado'));
    opciones.forEach(({ i, j }) => {
        const celdaElem = document.querySelector(`.tablero-damas div:nth-child(${i * tamañoTablero + j + 1})`);
        if (celdaElem) {
            celdaElem.classList.add('resaltado');
        }
    });
}

function coronarPieza(i, j) {
    if (tablero[i][j] && (i === 0 || i === tamañoTablero - 1)) {
        tablero[i][j].esDama = true;
        sonidoCoronacion.play(); // Reproduce el sonido de coronación
    }
}

function movimientoComputadora() {
    const movimientosPosibles = [];
    tablero.forEach((fila, i) => {
        fila.forEach((celda, j) => {
            if (celda && celda.color === 'negro') {
                const opciones = mostrarOpciones(i, j);
                opciones.forEach(opcion => {
                    movimientosPosibles.push({ desde: { i, j }, hasta: opcion });
                });
            }
        });
    });

    if (movimientosPosibles.length > 0) {
        const movimiento = movimientosPosibles[Math.floor(Math.random() * movimientosPosibles.length)];
        moverPieza(movimiento.desde.i, movimiento.desde.j, movimiento.hasta.i, movimiento.hasta.j);
    }
}

function verificarGanador() {
    const piezasBlancas = tablero.flat().filter(celda => celda && celda.color === 'blanco').length;
    const piezasNegras = tablero.flat().filter(celda => celda && celda.color === 'negro').length;

    if (piezasBlancas === 0) {
        return 'negro'; // Ganó el negro
    } else if (piezasNegras === 0) {
        return 'blanco'; // Ganó el blanco
    }
    return null;
}

function manejarVictoria() {
    const ganador = verificarGanador();

    if (ganador) {
        detenerTemporizadores(); // Detiene ambos temporizadores al final del juego

        if (ganador === 'blanco') {
            Swal.fire({
                title: '¡Ha ganado Jugador 1!',
                text: `Tiempo de fichas blancas: ${formatTiempo(tiempoBlanco)}\nTiempo de fichas negras: ${formatTiempo(tiempoNegro)}`,
                icon: 'success'
            });
            sonidoVictoriaBlanco.play();
        } else {
            Swal.fire({
                title: '¡Ha ganado Jugador 2!',
                text: `Tiempo de fichas blancas: ${formatTiempo(tiempoBlanco)}\nTiempo de fichas negras: ${formatTiempo(tiempoNegro)}`,
                icon: 'success'
            });
            sonidoVictoriaNegro.play();
        }

        // Reiniciar el juego después de un retraso
        setTimeout(() => {
            reiniciarDamas();
        }, 3000); // 3 segundos para mostrar la alerta y reproducir el sonido
    }
}

function formatTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
}

function iniciarTemporizador() {
    tiempoInicioTurno = Math.floor(Date.now() / 1000); // Tiempo de inicio del turno actual

    if (turno === 'blanco') {
        temporizadorJugadorBlanco = setInterval(() => {
            tiempoBlanco += 1;
            document.getElementById('cronometroPlayer').textContent = formatTiempo(tiempoBlanco);
            document.getElementById('cronometroPlayer1').textContent = formatTiempo(tiempoBlanco);
        }, 1000);
    } else {
        temporizadorJugadorNegro = setInterval(() => {
            tiempoNegro += 1;
            document.getElementById('cronometroRobot').textContent = formatTiempo(tiempoNegro);
            document.getElementById('cronometroRobot1').textContent = formatTiempo(tiempoNegro);
        }, 1000);
    }
}

function detenerTemporizadores() {
    clearInterval(temporizadorJugadorBlanco);
    clearInterval(temporizadorJugadorNegro);
}

function actualizarIconos() {
    const iconoBlanco = document.getElementById('iconoBlanco');
    const iconoNegro = document.getElementById('iconoNegro');
    const iconoBlanco1 = document.getElementById('iconoBlanco1');
    const iconoNegro1 = document.getElementById('iconoNegro1');

    if (turno === 'blanco') {
        iconoBlanco.classList.add('text-blue-500');
        iconoNegro.classList.remove('text-blue-500');
        iconoBlanco1.classList.add('text-blue-500');
        iconoNegro1.classList.remove('text-blue-500');
    } else {
        iconoNegro.classList.add('text-blue-500');
        iconoBlanco.classList.remove('text-blue-500');
        iconoNegro1.classList.add('text-blue-500');
        iconoBlanco1.classList.remove('text-blue-500');
    }
}
