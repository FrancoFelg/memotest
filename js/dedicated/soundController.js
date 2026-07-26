'use strict';

// Controlador global de sonidos
var SoundController = {

    sonidos: {
        flip: new Audio('../assets/sounds/voltear.mp3'),
        hide: new Audio('../assets/sounds/ocultar.mp3')
    },

    // Método principal para reproducir cualquier sonido
    play: function (nombreSonido) {

        var isSoundEnabled = isSoundsEnabled();

        if(isSoundEnabled == false) {
            return
        }

        var audio = this.sonidos[nombreSonido];
        if (audio) {
            audio.currentTime = 0; // Reiniciar tiempo por si se presiona rápido
            audio.play();
        }
    }
};