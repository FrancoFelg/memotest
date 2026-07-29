'use strict';

var audioFlip = new Audio('../assets/sounds/voltear.mp3');
var audioHide = new Audio('../assets/sounds/ocultar.mp3');
var audioButtonClick = new Audio('../assets/sounds/btn.mp3');
var audioVictory = new Audio('../assets/sounds/victoria.mp3');

var musicaMenu = new Audio('../assets/sounds/musicaFondo.mp3');
var musicaGame = new Audio('../assets/sounds/musicaPartida.mp3');

var musicaActual = null;
var volumenGeneral = 0.5;

function estaSilenciado() {
    if (typeof isSoundsEnabled === 'function') {
        return !isSoundsEnabled();
    }
    return false;
}

// Reproducción para SFX (Efectos de sonido breves)
function reproducirAudio(audioElemento) {
    if (estaSilenciado()) return;

    if (audioElemento) {
        audioElemento.muted = false;
        audioElemento.volume = volumenGeneral;
        audioElemento.currentTime = 0;
        audioElemento.play().catch(function (err) {
            console.warn("Error al reproducir audio:", err);
        });
    }
}

// SFX
function playFlipSound() { reproducirAudio(audioFlip); }
function playHideSound() { reproducirAudio(audioHide); }
function playButtonClickSound() { reproducirAudio(audioButtonClick); }
function playVictorySound() { reproducirAudio(audioVictory); }

// BGM (Música de fondo)
function playMenuMusic() { iniciarMusica(musicaMenu); }
function playGameMusic() { iniciarMusica(musicaGame); }

function iniciarMusica(pistaAudio) {
    if (musicaActual === pistaAudio && !musicaActual.paused) return;

    stopMusic();
    musicaActual = pistaAudio;

    if (musicaActual) {
        musicaActual.loop = true;
        musicaActual.volume = volumenGeneral;

        if (!estaSilenciado()) {
            var promise = musicaActual.play();
            if (promise !== undefined) {
                promise.catch(function (error) {
                    console.warn("Autoplay bloqueado:", error);
                });
            }
        }
    }
}

function stopMusic() {
    if (musicaActual) {
        musicaActual.pause();
        musicaActual.currentTime = 0;
        musicaActual = null;
    }
}

function alternarSilencio() {
    if (!musicaActual) return;

    if (estaSilenciado()) {

        musicaActual.pause();
    } else {

        musicaActual.play().catch(function (error) {
            console.warn("Error reanudando música:", error);
        });
    }
}

function inicializarSonidoBotones() {
    document.addEventListener('click', function (event) {
        var target = event.target;
        if (target && typeof target.closest === 'function') {
            var boton = target.closest('button, input[type="button"], input[type="submit"], .btn');
            if (boton) {
                playButtonClickSound();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    inicializarSonidoBotones();
});