'use strict';

// Controlador global de sonidos
var SoundController = {

    sonidos: {
        flip: new Audio('../assets/sounds/voltear.mp3'),
        hide: new Audio('../assets/sounds/ocultar.mp3'),
        buttonClick: new Audio('../assets/sounds/btn.mp3'),
    },

    musica:{
        menu: new Audio('../assets/sounds/musicaFondo.mp3'),
        game: new Audio('../assets/sounds/musicaPartida.mp3'),
    },

    musicaActual: null,

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
    },
    initButtonSounds: function () {
        document.addEventListener('click', function (event) {
            var target = event.target;

            // Verificamos de forma limpia si el click fue en un <button>, <input type="button"> o elemento con clase .btn
            if (target && typeof target.closest === 'function') {
                var boton = target.closest('button, input[type="button"], input[type="submit"], .btn');

                if (boton) {
                    SoundController.play('buttonClick');
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    SoundController.initButtonSounds();
});