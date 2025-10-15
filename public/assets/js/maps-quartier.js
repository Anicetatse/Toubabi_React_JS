// Configuration de l'API Mapbox
mapboxgl.accessToken = "pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w";

// Coordonnées et nom du quartier
const coord = [lng_quart, lat_quart];


const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: lng_quart && lat_quart ? coord : [-4.0279, 5.3200], // Centre sur [0, 0] si les coordonnées ne sont pas disponibles
  zoom: 12,
});

map.on("load", function () {
  if (lng_quart && lat_quart) {
    // Si les coordonnées sont disponibles, ajoutez le cercle
    addCircle(coord);
  } else {
    // Sinon, utilisez le service de géocodage pour obtenir les coordonnées
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(nom_quartier)}.json?access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(data => {
        const newCoord = data.features[0].geometry.coordinates;
        // alert(newCoord)
        addCircle(newCoord);
      });
  }
});

function addCircle(coordinates) {

    // Centre la carte sur les nouvelles coordonnées
    map.flyTo({
      center: coordinates,
      essential: true,
    });

  map.addLayer({
    id: "point-zone",
    type: "circle",
    source: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: coordinates,
            },
          },
        ],
      },
    },
    paint: {
      "circle-radius": {
        stops: [
          [12, 50],
          [22, 300],
        ],
        base: 2,
      },
      "circle-color": "#fb3a3a",
      "circle-opacity": 0.09,
    },
  });
}
