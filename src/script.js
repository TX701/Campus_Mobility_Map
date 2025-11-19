const urlBase = "https://n8n.oumobilitymap.com";
mapboxgl.accessToken = "";
let webhookGet = "";
let webhookPut = "";

let center = [-83.211269, 42.672954] // longitute, latitude
const bounds = [
  [-83.22176640342447, 42.6522409656694], // southwest
  [-83.19089575201713, 42.68139348920886] // northeast 
];
// let bounds = [[-83.1916, 42.6588], [-83.2237, 42.6795]];

// large space that will be outside of our bounds, we use it so we can darken everything outside of oakland
let wholeWord = [[-83.23946,42.6927258],[-83.238945,42.6925996],[-83.2387733,2.6394312],[-83.1568909,42.6389258],[-83.1570625,42.6941144],[-83.23946,42.6927258]];
// oaklands coordinates
let oakland = [[-83.19413, 42.68034], [-83.19321, 42.66018], [-83.19926, 42.66002], [-83.20724, 42.65725], [-83.21027, 42.65613], [-83.21299, 42.65534], [-83.21388, 42.65505], [-83.2145, 42.65479], [-83.21503, 42.65453], [-83.21601, 42.65417], [-83.21693, 42.65391], [-83.2178, 42.65366], [-83.21843, 42.65347], [-83.21923, 42.65323], [-83.21976, 42.65311], [-83.21972, 42.65348], [-83.2194, 42.65417], [-83.21845, 42.65559], [-83.21793, 42.65638], [-83.21765, 42.65703], [-83.21741, 42.65776], [-83.21721, 42.65851], [-83.21711, 42.65937], [-83.21717, 42.66044], [-83.21723, 42.6609], [-83.21737, 42.66157], [-83.21759, 42.6621], [-83.21791, 42.6628], [-83.2182, 42.6633], [-83.21897, 42.66484], [-83.21923, 42.66533], [-83.21957, 42.66612], [-83.21978, 42.66668], [-83.21986, 42.66756], [-83.21998, 42.6686], [-83.22014, 42.67004], [-83.22027, 42.67176], [-83.22029, 42.67243], [-83.22088, 42.67889], [-83.21978, 42.67887], [-83.21752, 42.67881], [-83.21677, 42.67885], [-83.2153, 42.67886], [-83.21451, 42.67899], [-83.21328, 42.67926], [-83.21236, 42.67955], [-83.2114, 42.67985], [-83.21036, 42.68003], [-83.20935, 42.68003], [-83.20835, 42.68005], [-83.20641, 42.6801], [-83.20196, 42.68019], [-83.20196, 42.68019], [-83.1946, 42.68031]];

// above oaklands coordinates are clockwise which is used when using two different polygons the first (counter clockwise) is the space and the second (clockwise) is a whole within that space. if we want to outline oakland alone we need its coordinates counterclockwise as well
let counterClockWise = [[-83.1946, 42.68031], [-83.20196, 42.68019], [-83.20196, 42.68019], [-83.20641, 42.6801], [-83.20835, 42.68005], [-83.20935, 42.68003], [-83.21036, 42.68003], [-83.2114, 42.67985], [-83.21236, 42.67955], [-83.21328, 42.67926], [-83.21451, 42.67899], [-83.2153, 42.67886], [-83.21677, 42.67885], [-83.21752, 42.67881], [-83.21978, 42.67887], [-83.22088, 42.67889], [-83.22029, 42.67243], [-83.22027, 42.67176], [-83.22014, 42.67004], [-83.21998, 42.6686], [-83.21986, 42.66756], [-83.21978, 42.66668], [-83.21957, 42.66612], [-83.21923, 42.66533], [-83.21897, 42.66484], [-83.2182, 42.6633], [-83.21791, 42.6628], [-83.21759, 42.6621], [-83.21737, 42.66157], [-83.21723, 42.6609], [-83.21717, 42.66044], [-83.21711, 42.65937], [-83.21721, 42.65851], [-83.21741, 42.65776], [-83.21765, 42.65703], [-83.21793, 42.65638], [-83.21845, 42.65559], [-83.2194, 42.65417], [-83.21972, 42.65348], [-83.21976, 42.65311], [-83.21923, 42.65323], [-83.21843, 42.65347], [-83.2178, 42.65366], [-83.21693, 42.65391], [-83.21601, 42.65417], [-83.21503, 42.65453], [-83.2145, 42.65479], [-83.21388, 42.65505], [-83.21299, 42.65534], [-83.21027, 42.65613], [-83.20724, 42.65725], [-83.19926, 42.66002], [-83.19321, 42.66018], [-83.19413, 42.68034]]

let urlTestGet = ""; // testing the workflow
let urlProductionGet = "";

let formTestURLPut = ""; // testing the workflow
let formProductionPut = "";

let colorArray = ["#92F797", "#D2F792", "#EFF792", "#F7D292", "#F79292"];

window.addEventListener("load", () => {
    mapboxgl.accessToken = import.meta.env.VITE_API_KEY;
    webhookGet = import.meta.env.VITE_WEBHOOK_GET;
    webhookPut = import.meta.env.VITE_WEBHOOK_PUT;

    console.log(mapboxgl.accessToken, webhookGet, webhookPut);

    urlTestGet = `${urlBase}/webhook-test/${webhookGet}`; // testing the workflow
    urlProductionGet = `${urlBase}/webhook/${webhookGet}`;

    formTestURLPut = `${urlBase}/webhook-test/${webhookPut}`;
    formProductionPut = `${urlBase}/webhook/${webhookPut}`;

    fetch(urlProductionGet, {
        headers: {
            "ngrok-skip-browser-warning": true,
        }}).then(response => {
            console.log(response);
            if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
            }
            return response.json();
        }).then(data => {
            constructPinPoints(data);
        }).catch(error => {console.error("Error:", error);
    });
});

const constructPinPoints = (data) => {
  data.forEach(element => {
    let text = `Location: ${element.Location}\n\nDifficulty: ${element.Difficulty}\n\nDescription: ${element.Description}`
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(text);
    let marker = new mapboxgl.Marker().setLngLat([element.Longitude, element.Latitude]).setPopup(popup).addTo(map);
    let svg = marker._element.getElementsByTagName("svg")[0];
    let path = svg.getElementsByTagName("path")[0];
    path.setAttribute("fill", colorArray[element.Difficulty - 1]);
  });
}

const formSample = (data) => {  
  let object = {};
  data.forEach((value, key) => object[key] = value);
  
  console.log("Currently attempting to submit point to table.");
  fetch(formProductionPut, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(object)
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Success:", data);
    console.log("Point successfully added to the table.");
  }).catch(error => {
    console.error("Error:", error);
  });
}

const formRemoveOnClick = () => {
  document.querySelector("#point-form").remove();
  document.querySelector("#mapContainer").removeEventListener("click", formRemoveOnClick);
  document.querySelector("#mapContainer").removeEventListener("contextmenu", formRemoveOnClick);
}

const setFormEventListeners = () => {
  document.querySelector("#mapContainer").addEventListener("click", formRemoveOnClick);
  document.querySelector("#mapContainer").addEventListener("contextmenu", formRemoveOnClick);
}

const createForm = (e) => {
  const formHtml = `<form id="point-form">
                      <label for="difficulty">Ease:</label>
                      <input type="number" id="difficulty" name="difficulty" required>
                      <br>
                      <label for="location">Location:</label>
                      <input type="text" id="location" name="location" required>
                      <br>
                      <label for="description">Description:</label>
                      <input type="text" id="description" name="description" required>
                      <br>
                      <button type="submit">Submit</button>
                      <input type="hidden" id="long" name="long" value="${e.lngLat.lng}">
                      <input type="hidden" id="lat" name="lat" value="${e.lngLat.lat}">
                    </form>`
  
  document.querySelector("body #container").insertAdjacentHTML("beforeend", formHtml);
  const form = document.querySelector("#point-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formSample(new FormData(form));
    form.remove();
    document.querySelector("#mapContainer").removeEventListener("click", formRemoveOnClick);
    document.querySelector("#mapContainer").removeEventListener("contextmenu", formRemoveOnClick);
  });

  form.style.position = "absolute";
  form.style.left = `${e.point.x}px`;
  form.style.top = `${e.point.y}px`;

  setFormEventListeners();
}

const map = new mapboxgl.Map({
  container: "map",
  center: center, 
  style: "mapbox://styles/mapbox/standard",
  maxBounds: bounds,
  config: {
    basemap: {
      // lightPreset: "dusk",
    }
  },
  zoom: 16
});

map.on("load", () => {
    map.addSource("Oakland", {
        "type": "geojson",
        "data": {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                  wholeWord, oakland
                ]
            }
        }
    });

    map.addLayer({
        "id": "Oakland-Polygon",
        "type": "fill",
        "source": "Oakland",
        "paint": {
          "fill-color": "rgba(0, 0, 0, 0.6)",
        }
    });

    map.addInteraction("places-mouseenter-interaction", {
      type: "mouseenter",
      target: { layerId: "places" },
      handler: () => {
          map.getCanvas().style.cursor = "pointer";
      }
    });

    map.on("contextmenu", (e) => {
      createForm(e);
    });
});
