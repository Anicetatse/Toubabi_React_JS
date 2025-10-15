// public/js/estimations.js

document.addEventListener("DOMContentLoaded", function () {
    var estimationForm = document.getElementById('estimation-form');
    var estimationsList = document.getElementById('estimations-list');

    estimationForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Effectuez une requête AJAX pour envoyer le formulaire
        fetch('/estimations', {
            method: 'POST',
            body: new FormData(estimationForm),
        })
        .then(response => response.json())
        .then(data => {
            // Mettez à jour la zone d'affichage des estimations
            updateEstimationsUI(data.estimations);
        })
        .catch(error => console.error('Erreur lors de la soumission du formulaire:', error));
    });

    // Fonction pour mettre à jour la zone d'affichage des estimations
    function updateEstimationsUI(estimations) {
        estimationsList.innerHTML = ''; // Efface la liste existante

        if (estimations.length === 0) {
            var message = document.createElement('p');
            message.textContent = 'Aucune estimation disponible.';
            estimationsList.appendChild(message);
        } else {
            var ul = document.createElement('ul');
            estimations.forEach(function (estimation) {
                var li = document.createElement('li');
                li.textContent = 'Quartier: ' + estimation.quartier.nom + ', Coefficient: ' + estimation.coefficient_occupa_sols + ', Hauteur: ' + estimation.hauteur;
                ul.appendChild(li);
            });
            estimationsList.appendChild(ul);
        }
    }
});
