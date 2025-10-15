// Configuration de l'API Mapbox
mapboxgl.accessToken =
  "pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w";

let defaultZoom = 11; // pour les écrans plus grands
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
      "</span>";

    // Créer un popup pour chaque marqueur
    if (!bati ) {
        // alert(bati)
        venal = marqueur.prix_venal != null ? formatNumberWithSpaces(marqueur.prix_venal) : ' - '
        march = marqueur.prix_marchand != null ?  formatNumberWithSpaces(marqueur.prix_marchand) : ' - '
        moyenne = marqueur.prix_moyen != null ?  formatNumberWithSpaces(marqueur.prix_moyen) : ' - '
      var popup = new mapboxgl.Popup({
        offset: 25,
      }).setHTML(
        '<div class="popup-content" ><h4>' +
          marqueur.titre +
          "</h4>" +
          "<p style='color:red;font-size:13px'>Index DGI (prix / m²)</p>"+
          "<strong>Valeur vénale* (FCFA)</strong>" +
          " : " +
          venal  +
          "<br>" +
          "<strong>Valeur Marchande* (FCFA)</strong>" + 
          " : " +
          march  +
          "<br>" +
          "<strong>Coût estimatif actualisé** (FCFA)</strong>" +
          " : " +
          moyenne +
          "<br><br>" +
          "<p style='color:red;font-size:11px;margin-top:8px'></p>" +
          "</div>"
      );
    } else {
      // alert(marqueur.prix_min_location !=null ? formatNumberWithSpaces(marqueur.prix_min_location) : ' - ' )
      pmil = marqueur.prix_min_location !=null ? formatNumberWithSpaces(marqueur.prix_min_location) : ' - ';
      pmal = marqueur.prix_max_location !=null ? formatNumberWithSpaces(marqueur.prix_max_location) : ' - ';
      pmiv = marqueur.prix_min_vente  !=null ? formatNumberWithSpaces(marqueur.prix_min_vente) : ' - ' ;
      pmav = marqueur.prix_max_vente !=null ? formatNumberWithSpaces(marqueur.prix_max_vente) : ' - ' ;
      var popup = new mapboxgl.Popup({
        offset: 25,
      }).setHTML(
        '<div class="popup-content"><h4>' +
          marqueur.titre +
          "</h4>" +
          "<strong>Location</strong><br>" +
          "prix minimum (FCFA) : " +
          pmil +
          " <br>" +
          "Prix maximum (FCFA) : " +
          pmal +
          " <br><br>" +
          "<strong>Vente</strong><br>" +
          "prix minimum (FCFA) : " +
          pmiv+
          "<br>" +
          "Prix maximum (FCFA) : " +
          pmav +
          " <br>" +
          "<p style='color:red;font-size:11px;margin-top:8px'>* cliquez pour plus de détails</p>" +
          "</div>"
      );
    }

    var marker = new mapboxgl.Marker(el, {
      color: "#E00034",
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

      if (!bati) {
        venal = marqueur.prix_venal != null ? formatNumberWithSpaces(marqueur.prix_venal) : " - ";
        march = marqueur.prix_marchand != null ? formatNumberWithSpaces(marqueur.prix_marchand) : " - ";
        moyenne = marqueur.prix_moyen != null ? formatNumberWithSpaces(marqueur.prix_moyen) : " - "
        entete =
        '<table class="table table-responsive table-striped"><tr><th>Valeur Venale <span style="color: red">*</span> (FCFA)</th><th>Valeur Marchande <span style="color: red">*</span> (FCFA)</th></tr>';
        info += entete;
        info +=
        "<tr><td>" +
        venal  +
        "</td><td>" +
        march +
        "</td><tr>";
      info += "</table>";

      

      entete2 =
      '<table class="table table-responsive table-striped"><tr><th>Coût estimatif actualisé <span style="color: red">**</span> (FCFA)</th></tr>';
      info += entete2;
      info +=
      "<tr><td>" +
      moyenne +
      "</td></tr>";
    info += "</table>";

    
      }
      else{
      entete =
        '<table class="table table-responsive table-striped"><tr><th>Types de biens</th><th>Prix minimum</th><th>Prix moyen</th><th>Prix maximum</th></tr>';
      for (let s = 0; s < marqueur.prix.length; s++) {
        const prix = marqueur.prix[s];
        tab_location +=
          "<tr><td>" +
          prix.type +
          "</td><td>" +
          formatNumberWithSpaces(prix.prix_min_location) +
          "</td><td>" +
          formatNumberWithSpaces(prix.prix_moy_location) +
          "</td><td>" +
          formatNumberWithSpaces(prix.prix_max_location) +
          "</td></tr>";

        tab_vente +=
          "<tr><td>" +
          prix.type +
          "</td><td>" +
          formatNumberWithSpaces(prix.prix_min_vente) +
          "</td><td>" +
          formatNumberWithSpaces(prix.prix_moy_vente) +
          "</td><td>" +
          formatNumberWithSpaces(prix.prix_max_vente) +
          "</td></tr>";
      }

      info += "<h5>LOCATION</h5>";
      info += entete;
      info += tab_location;
      // info +=
      info += "</table>";
      info += "<h5>VENTE</h5>" + entete;
      info += tab_vente;

      info += "</table>";
    }
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

  // Fonctions de partage (exemple pour WhatsApp)
  document
    .getElementById("share-whatsapp")
    .addEventListener("click", function () {
      var text = "Découvrez ces propriétés sur Toubabi!";
      var url = window.location.href;
      window.open(
        "https://wa.me/?text=" + encodeURIComponent(text + " " + url)
      );
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
