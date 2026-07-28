'use strict';

document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    var decksContainer = document.getElementById('decksContainer');
    var btnOpenModal = document.getElementById('btnOpenModal');
    var btnCloseModal = document.getElementById('btnCloseModal');
    var btnCancelModal = document.getElementById('btnCancelModal');
    var deckModal = document.getElementById('deckModal');
    var createDeckForm = document.getElementById('createDeckForm');
    var formError = document.getElementById('formError');
    var imagesPath = "../../assets/images/defaults/";

    // Inicializar visualización de barajas
    renderDecks();

    function generate18FileInputs() {
        var container = document.getElementById('inputsGrid');
        if (!container) return;

        container.innerHTML = '';
        for (var i = 1; i <= 18; i++) {
            var wrapper = document.createElement('div');
            wrapper.className = 'file-input-item';

            wrapper.innerHTML =
                '<label for="cardImg_' + i + '">Carta ' + i + '</label>' +
                '<input type="file" id="cardImg_' + i + '" name="card_' + i + '" accept="image/*" required />';

            container.appendChild(wrapper);
        }
    }

    // Evento al abrir el modal
    var btnOpenModal = document.getElementById('btnOpenModal');
    if (btnOpenModal) {
        btnOpenModal.addEventListener('click', function () {
            generate18FileInputs(); // Inyecta las 18 casillas en formato 3x6
            var modal = document.getElementById('deckModal');
            if (modal) {
                modal.classList.remove('hidden');
            }
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }

    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', closeModal);
    }

    function closeModal() {
        deckModal.classList.add('hidden');
    }

    // ----------------------------------------------------
    // SUBMIT DEL FORMULARIO Y GUARDADO EN BBDD LOCAL
    // ----------------------------------------------------
    if (createDeckForm) {
        createDeckForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var titleInput = document.getElementById('deckTitle');
            var descriptionInput = document.getElementById('deckDescription');
            var formError = document.getElementById('formError');

            var deckTitle = titleInput ? titleInput.value.trim() : 'Mazo Personalizado';
            var deckDescription = descriptionInput ? descriptionInput.value.trim() : '';

            var loadedCards = [];
            var totalImages = 18;
            var filesProcessed = 0;

            for (var i = 1; i <= totalImages; i++) {
                (function (index) {
                    var fileInput = document.getElementById('cardImg_' + index);
                    var file = (fileInput && fileInput.files) ? fileInput.files[0] : null;

                    if (!file) {
                        if (formError) {
                            formError.textContent = 'Falta seleccionar la imagen ' + index;
                            formError.classList.remove('hidden');
                        }
                        return;
                    }

                    var reader = new FileReader();
                    reader.onload = function (event) {
                        // Guardamos la estructura requerida: id, img y name
                        loadedCards[index - 1] = {
                            id: index,
                            img: event.target.result, // Data URL Base64 de la imagen subida
                            name: deckTitle.toLowerCase() + ' ' + index
                        };

                        filesProcessed++;

                        // Una vez procesadas las 18 imágenes, persistimos la baraja
                        if (filesProcessed === totalImages) {
                            saveDeckToDatabase(deckTitle, deckDescription, loadedCards);
                            closeModal();
                            renderDecks();
                        }
                    };

                    reader.readAsDataURL(file);
                })(i);
            }
        });
    }

    // ----------------------------------------------------
    // RENDERIZADO DE LOS TOGGLES DE BARAJA
    // ----------------------------------------------------
    function renderDecks() {
        if (!decksContainer) return;

        decksContainer.innerHTML = '';
        var db = getDatabase(); // Función de storage.js

        if (!db || !db.decks || db.decks.length === 0) {
            decksContainer.innerHTML = '<p>No hay barajas disponibles.</p>';
            return;
        }

        for (var i = 0; i < db.decks.length; i++) {
            var deck = db.decks[i];
            var isDefaultDeck = deck.isDefault;

            // Crear contenedor de la baraja
            var deckCard = document.createElement('article');
            deckCard.className = 'deck-card';

            // Cabecera interactiva (Toggle)
            var deckHeader = document.createElement('div');
            deckHeader.className = 'deck-header-toggle';
            deckHeader.setAttribute('data-deck-id', deck.id);

            deckHeader.innerHTML =
                '<div>' +
                '<h3 class="deck-title">' + escapeHTML(deck.title) + '</h3>' +
                '<p class="deck-description">' + escapeHTML(deck.description) + '</p>' +
                '</div>' +
                '<span class="toggle-icon">+</span>';

            // Grilla de las 18 cartas (inicialmente oculta)
            var cardsGrid = document.createElement('div');
            cardsGrid.className = 'deck-cards-grid hidden';

            var cardsList = deck.cards || [];
            for (var j = 0; j < cardsList.length; j++) {
                var card = cardsList[j];
                var cardItem = document.createElement('div');
                cardItem.className = 'card-preview';

                var imageSrc = '';

                if (isDefaultDeck) {
                    // Baraja por defecto:
                    // Si la carta tiene propiedad img y ya contiene "assets/", le agregamos sólo la salida de carpetas "../../"
                    if (card && card.img) {
                        if (card.img.indexOf('assets/') === 0) {
                            imageSrc = '../../' + card.img;
                        } else if (card.img.indexOf('../') === 0) {
                            imageSrc = card.img;
                        } else {
                            imageSrc = imagesPath + card.img;
                        }
                    } else {
                        // Si no tiene la propiedad img, armamos la ruta usando el título del mazo
                        imageSrc = imagesPath + deck.title.toLowerCase() + '/' + (j + 1) + '.png';
                    }
                } else {
                    // Baraja personalizada (Base64 guardado en BBDD local):
                    if (typeof card === 'string') {
                        imageSrc = card;
                    } else if (card) {
                        imageSrc = card.img || card.image || '';
                    }
                }

                cardItem.innerHTML = '<img src="' + imageSrc + '" alt="Carta ' + (j + 1) + '" />';
                cardsGrid.appendChild(cardItem);
            }

            // Evento Clic para desplegar/contraer (Toggle)
            deckHeader.addEventListener('click', function (e) {
                var currentHeader = e.currentTarget;
                var targetGrid = currentHeader.nextElementSibling;
                var icon = currentHeader.querySelector('.toggle-icon');

                var isHidden = targetGrid.classList.contains('hidden');

                if (isHidden) {
                    targetGrid.classList.remove('hidden');
                    icon.textContent = '-';
                } else {
                    targetGrid.classList.add('hidden');
                    icon.textContent = '+';
                }
            });

            deckCard.appendChild(deckHeader);
            deckCard.appendChild(cardsGrid);
            decksContainer.appendChild(deckCard);
        }
    }

    // ----------------------------------------------------
    // PERSISTENCIA EN BBDD LOCAL (storage.js)
    // ----------------------------------------------------
    function saveDeckToDatabase(title, description, cards) {
        var db = getDatabase();
        if (!db.decks) {
            db.decks = [];
        }

        var newDeckId = db.decks.length > 0 ? (db.decks[db.decks.length - 1].id + 1) : 1;

        var newDeck = {
            id: newDeckId,
            title: title,
            description: description,
            cards: cards
        };

        db.decks.push(newDeck);
        saveDatabase(db); // Función de storage.js
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
});