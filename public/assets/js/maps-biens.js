// Configuration de l'API Mapbox
mapboxgl.accessToken =
  "pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w";

let defaultZoom = 12; // pour les écrans plus grands
let defaultCoord = [-3.9725785, 5.3647141]; // Coordonnées

// Si la largeur de l'écran est inférieure à 768 pixels (typiquement un mobile)
if (window.innerWidth < 768) {
  defaultZoom = 11; // niveau de zoom plus éloigné pour les mobiles
  defaultCoord = [-3.9725785, 5.3647141];
}

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-5.5471, 7.5401], // Coordonnées de la Côte d'Ivoire
  zoom: 4, // Zoom initial plus éloigné
});

map.addControl(new mapboxgl.NavigationControl());

map.on("load", function () {
  map.flyTo({
    center: defaultCoord,
    zoom: defaultZoom, // Niveau de zoom souhaité pour Abidjan
    speed: 1, // Vitesse de l'animation, 1 étant la vitesse normale
    curve: 2, // Courbe de l'animation, 1 étant une courbe linéaire
    easing: function (t) {
      return t * (2 - t);
    }, // Fonction d'atténuation pour l'animation
  });
  // Fonction pour afficher les marqueurs sur la carte
  marqueurs.forEach(function (marqueur) {
    var el = document.createElement("div");
    el.className = "custom-marker";

    el.setAttribute("data-step", "1");
    el.setAttribute("data-intro", "Cliquez pour plus de détails");

    el.innerHTML =
      // '<span class="marker-title" title="">' +
      //Fmarqueur.titre +
      // "</span>";

    // Créer un popup pour chaque marqueur
    nbre_quartier = marqueur.nbre_biens != null ? formatNumberWithSpaces(marqueur.nbre_biens) : ' - '
    nbre_vente = marqueur.nbre_vente != null ? formatNumberWithSpaces(marqueur.nbre_vente) : ' - '
    nbre_location = marqueur.nbre_location != null ? formatNumberWithSpaces(marqueur.nbre_location) : ' - '
    var popup = new mapboxgl.Popup({
      offset: 25,
    }).setHTML(
      '<div class="popup-content" ><h4>' +
        marqueur.titre +
        "</h4>" +
        // "<p style='color:red;font-size:13px'>Index DGI (prix / m²)</p>"+
        "<strong>" +
        nbre_location  +
        " </strong> bien(s) en location" +

        "<strong><br>" +
        nbre_vente  +
        " </strong> bien(s) en vente" +
        
        "<br><br>" +
        // "<p style='color:red;font-size:11px;margin-top:8px'>* cliquez pour plus de détails</p>" +
        "</div>"
    );
    var marker = new mapboxgl.Marker( {
      color: "#00ff00",
    })
      .setLngLat([marqueur.lng, marqueur.lat])
      .setPopup(popup)
      .addTo(map);

    // Au survol du marqueur, affichez le popup
    marker.getElement().addEventListener("mouseenter", () => popup.addTo(map));
    marker.getElement().addEventListener("mouseleave", () => popup.remove());
    marker.getElement().addEventListener("click", function () {
      // document.getElementById("sidebar").style.display = "block";
      const sidebar = document.getElementById("sidebar");
      sidebar.style.transform = "translateX(0%)"; // Animation de glissement
      console.log(marqueur);
      // Récupérez les informations depuis le contrôleur Laravel
      var info =
        // '<img style="" src="'+marqueur.commune.image+'" class="img-fluid" alt="">'+

        '<div style="width:100%;background-image:url(/' +
        marqueur.commune.image +
        ');background-size:cover ">' +
        '<h2 class="text-center" style="text-transform:uppercase;color:black">' +
        marqueur.titre +
        "</h2></div>" +
        '<p style="text-align:center;font-weight:bold" class="text-center" id="com">' +
        marqueur.commune.nom +
        "</p>" +
        "<br>";

      tab_location = "";
      tab_vente = "";

   
      nbre_vente = marqueur.nbre_vente != null ? formatNumberWithSpaces(marqueur.nbre_vente) : ' - '
      nbre_location = marqueur.nbre_location != null ? formatNumberWithSpaces(marqueur.nbre_location) : ' - '
        entete =
        '<table class="table table-responsive table-striped"><tr><th>Nombre de bien en location</th><th>Nombre de bien en vente</th></tr>';
        info += entete;
        info +=
        "<tr><td>" +
        nbre_location  +
        "</td><td>" +
        nbre_vente +
        " </td><tr>";
      info += "</table>";


      // entete2 =
      // '<table class="table table-responsive table-striped"><tr><th>Moyenne réelle estimée <span style="color: red">**</span></th></tr>';
      // info += entete2;
      // info +=
      // "<tr><td> - </td></tr>";
    info += "</table>";


      
      document.getElementById("info").innerHTML = info;
    });
  });

  // Fermer la barre latérale
  document
    .getElementById("close-sidebar")
    .addEventListener("click", function () {
      // document.getElementById("sidebar").style.display = "none";
      const sidebar = document.getElementById("sidebar");
      sidebar.style.transform = "translateX(-100%)"; // Animation de glissement pour fermer
    });

  // Agrandir la barre latérale
  document
    .getElementById("expand-sidebar")
    .addEventListener("click", function () {
      var sidebar = document.getElementById("sidebar");

      sidebar.style.width =
        sidebar.style.width === "300px" || sidebar.style.width === ""
          ? "100%"
          : "40%";
    });


});

function formatNumberWithSpaces(number) {
  return number.toLocaleString("fr-FR").replace(/,/g, " ");
}

document.getElementById("search-input").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (query.length > 0) {
    marqueurs.forEach(function (marqueur) {
      if (marqueur.titre.toLowerCase().includes(query)) {
        const div = document.createElement("div");
        div.innerText = marqueur.titre;
        div.addEventListener("click", function () {
          map.flyTo({
            center: [marqueur.lng, marqueur.lat],
            zoom: defaultZoom + 5,
            speed: 1,
            curve: 2,
            easing: function (t) {
              return t * (2 - t);
            },
          });

          suggestions.innerHTML = "";
          document.getElementById("search-input").value = marqueur.titre;
        });
        suggestions.appendChild(div);
      }
    });
  }
});

map.on("load", function () {
  // Assurez-vous que les marqueurs sont déjà ajoutés à la carte
  if (marqueurs && marqueurs.length > 0) {
    const firstMarqueur = marqueurs[0]; // Prenez le premier marqueur comme exemple
    const bubble = document.getElementById("intro-bubble");

    // Convertissez les coordonnées du marqueur en pixels pour positionner la bulle
    const pixelCoord = map.project([firstMarqueur.lng, firstMarqueur.lat]);

    bubble.style.left = pixelCoord.x - 15 + "px";
    bubble.style.top = pixelCoord.y + 10 + "px"; // 30px pour positionner la bulle au-dessus du marqueur
    bubble.style.display = "block";

    // Cachez la bulle après quelques secondes
    setTimeout(function () {
      bubble.style.display = "none";
    }, 5000); // 5000ms soit 5 secondes
  }
});
