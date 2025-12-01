const urlBase = "https://n8n.oumobilitymap.com";
const center = [-83.211269, 42.672954] // longitute, latitude
const offsetFromPointToForm = 100;

const bounds = [
  [-83.22176640342447, 42.6522409656694], // southwest
  [-83.19089575201713, 42.68139348920886] // northeast 
];

// large space that will be outside of our bounds, we use it so we can darken everything outside of oakland
let wholeWord = [[-83.23946,42.6927258],[-83.238945,42.6925996],[-83.2387733,2.6394312],[-83.1568909,42.6389258],[-83.1570625,42.6941144],[-83.23946,42.6927258]];
// oaklands coordinates
let oakland = [[-83.19413, 42.68034], [-83.19321, 42.66018], [-83.19926, 42.66002], [-83.20724, 42.65725], [-83.21027, 42.65613], [-83.21299, 42.65534], [-83.21388, 42.65505], [-83.2145, 42.65479], [-83.21503, 42.65453], [-83.21601, 42.65417], [-83.21693, 42.65391], [-83.2178, 42.65366], [-83.21843, 42.65347], [-83.21923, 42.65323], [-83.21976, 42.65311], [-83.21972, 42.65348], [-83.2194, 42.65417], [-83.21845, 42.65559], [-83.21793, 42.65638], [-83.21765, 42.65703], [-83.21741, 42.65776], [-83.21721, 42.65851], [-83.21711, 42.65937], [-83.21717, 42.66044], [-83.21723, 42.6609], [-83.21737, 42.66157], [-83.21759, 42.6621], [-83.21791, 42.6628], [-83.2182, 42.6633], [-83.21897, 42.66484], [-83.21923, 42.66533], [-83.21957, 42.66612], [-83.21978, 42.66668], [-83.21986, 42.66756], [-83.21998, 42.6686], [-83.22014, 42.67004], [-83.22027, 42.67176], [-83.22029, 42.67243], [-83.22088, 42.67889], [-83.21978, 42.67887], [-83.21752, 42.67881], [-83.21677, 42.67885], [-83.2153, 42.67886], [-83.21451, 42.67899], [-83.21328, 42.67926], [-83.21236, 42.67955], [-83.2114, 42.67985], [-83.21036, 42.68003], [-83.20935, 42.68003], [-83.20835, 42.68005], [-83.20641, 42.6801], [-83.20196, 42.68019], [-83.20196, 42.68019], [-83.1946, 42.68031]];
// above oaklands coordinates are clockwise which is used when using two different polygons the first (counter clockwise) is the space and the second (clockwise) is a whole within that space. if we want to outline oakland alone we need its coordinates counterclockwise as well
let counterClockWise = [[-83.1946, 42.68031], [-83.20196, 42.68019], [-83.20196, 42.68019], [-83.20641, 42.6801], [-83.20835, 42.68005], [-83.20935, 42.68003], [-83.21036, 42.68003], [-83.2114, 42.67985], [-83.21236, 42.67955], [-83.21328, 42.67926], [-83.21451, 42.67899], [-83.2153, 42.67886], [-83.21677, 42.67885], [-83.21752, 42.67881], [-83.21978, 42.67887], [-83.22088, 42.67889], [-83.22029, 42.67243], [-83.22027, 42.67176], [-83.22014, 42.67004], [-83.21998, 42.6686], [-83.21986, 42.66756], [-83.21978, 42.66668], [-83.21957, 42.66612], [-83.21923, 42.66533], [-83.21897, 42.66484], [-83.2182, 42.6633], [-83.21791, 42.6628], [-83.21759, 42.6621], [-83.21737, 42.66157], [-83.21723, 42.6609], [-83.21717, 42.66044], [-83.21711, 42.65937], [-83.21721, 42.65851], [-83.21741, 42.65776], [-83.21765, 42.65703], [-83.21793, 42.65638], [-83.21845, 42.65559], [-83.2194, 42.65417], [-83.21972, 42.65348], [-83.21976, 42.65311], [-83.21923, 42.65323], [-83.21843, 42.65347], [-83.2178, 42.65366], [-83.21693, 42.65391], [-83.21601, 42.65417], [-83.21503, 42.65453], [-83.2145, 42.65479], [-83.21388, 42.65505], [-83.21299, 42.65534], [-83.21027, 42.65613], [-83.20724, 42.65725], [-83.19926, 42.66002], [-83.19321, 42.66018], [-83.19413, 42.68034]]

let formProductionPut = "";
let map = null; // map object
let pointArray = []; // array of points

let colorArray = ["#92F797", "#D2F792", "#EFF792", "#F7D292", "#F79292"]; // color to match difficulty
let menuOpen = false;
let difficultyValue = null;

const setUpWelcomeScreen = () => { // show an explaination message if its the users first time on the website
  let cookies = document.cookie;
  if (cookies === "") { // if it is the users first time on the website
    document.cookie = `visited=true`; // set a cookie named visited to true

    document.querySelector("#enter-website").addEventListener("click", () => {
        document.querySelector(".welcome-message").remove();
    });
  } else {
    document.querySelector(".welcome-message").remove(); // if it is not the users first time dont show the welcome message
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  setUpWelcomeScreen();

  mapboxgl.accessToken = import.meta.env.VITE_API_KEY;
  let webhookPointGet = import.meta.env.VITE_WEBHOOK_GET_POINT;
  let webhookEventGet = import.meta.env.VITE_WEBHOOK_GET_EVENT;
  let webhookPut = import.meta.env.VITE_WEBHOOK_PUT;
  
  let urlProductionPointGet = `${urlBase}/webhook/${webhookPointGet}`; // N8N URL for getting user points
  let urlProductionEventGet = `${urlBase}/webhook/${webhookEventGet}`; // N8N URL for getting event points
  formProductionPut = `${urlBase}/webhook/${webhookPut}`; // N8N URL for putting form points into the table

  map = new mapboxgl.Map({
      container: "map",
      center: center, 
      style: "mapbox://styles/mapbox/standard",
      maxBounds: bounds, // prevent the user from looking outside of oakland
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
                    wholeWord, oakland // the map is only slightly bigger than oakland to avoid uneeded rendering
                  ]
              }
          }
      });

      map.addLayer({ // places a dark overlay on the map outside of oakland
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

      map.on("click", () => { // on left click, if a form is open, close it
        if (menuOpen) {
          menuOpen = false; 
          document.querySelector("#point-form").remove(); // remove the form
          document.querySelector("#temp-point").remove(); // remove the temporary point
        }
      });

      map.on("contextmenu", (e) => { // on right click, if a form is open, close it. if a form is not open, create one
        if (menuOpen) {
          menuOpen = false;
          document.querySelector("#point-form").remove(); // remove the form
          document.querySelector("#temp-point").remove(); // remove the temporary point
        } else {
          menuOpen = true;
          createForm(e); // create new form
        }
      });
  });

  map.dragRotate.disable(); // dont allow the user to change the z perspective of the map or rotation
  map.touchZoomRotate.disableRotation();

  constructPinPoints(await getPoints(urlProductionPointGet)); // create pin points from airtable
  constructEventPoints(await getPoints(urlProductionEventGet)); // create event points from airtable
  fixOverLap(); // adjust for if two points have the same latitude and longitude
});

const getPoints = async (url) => { // get points from the given N8N url. will either be event points or user points
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
      return response.json();
    }).then(data => {
        return data; // return points
    }).catch(error => {
      console.error("Error:", error);
      return error;
  });
}

const constructPinPoints = (data) => { // create popup on map corresponding to user points
  data.forEach(element => {
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(createUserPinDisplay(element)); // sets the HTML
    popup._content.querySelector(".circle").style.background = `${colorArray[element.Difficulty - 1]}`; // sets the points color on the map
    let marker = new mapboxgl.Marker().setLngLat([element.Longitude, element.Latitude]).setPopup(popup).addTo(map); // set the location on the map
    let svg = marker._element.getElementsByTagName("svg")[0];
    let path = svg.getElementsByTagName("path")[0];
    path.setAttribute("fill", colorArray[element.Difficulty - 1]); // fill the point with the color
    pointArray.push(marker); // add to array of all markers
  });
}

const constructEventPoints = (data) => { // create popup on map corresponding to event points
  data.forEach(element => {
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(createEventPinDisplay(element)); // sets the HTML
    let marker = new mapboxgl.Marker().setLngLat([element.Longitude, element.Latitude]).setPopup(popup).addTo(map); // set the location on the map
    let svg = marker._element.getElementsByTagName("svg")[0];
    let path = svg.getElementsByTagName("path")[0];
    path.setAttribute("fill", "#df92f7"); // sets the points color on the map (all events are purple)
    pointArray.push(marker); // add to array of all markers
  });
}

const getOverLap = (point) => { // return list of objects with the same latitude and longitude as the given point
  let overlap = [];
  for (let i = 0; i < pointArray.length; i++) {
    let comparePoint = pointArray[i];
    if (comparePoint != point && ((point._lngLat.lat == comparePoint._lngLat.lat) && (point._lngLat.log == comparePoint._lngLat.log))) {
      overlap.push(comparePoint);
    }
  }
  return overlap; // return the array of overlap points
}

const fixOverLap = () => {
  pointArray.forEach(point => {
    let overlap = getOverLap(point); // objects with the same latitude and longitude as the given point

    for (let i = 0; i < overlap.length; i++) {
      let longLat = overlap[i]._lngLat; // get the current latitude and longitude
      let offset = 0.000005 * (i + 1); // create an offset- uses i so all the points being changed dont end up on the same latitude and longitude
      overlap[i].setLngLat([longLat.lng + offset, longLat.lat + offset]); // give the point a new latitude and longitude. this will only slightly move the point
    }
  });
}

const fadeOut = () => { // modified from https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
  const element = document.querySelector("#container .pop-up");
    let op = 1;
    let timer = setInterval( () => {
        if (op <= 0.1){
            clearInterval(timer);
            document.querySelector("#container .pop-up").remove();
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

const fadeIn = () => { // modified from https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
  const element = document.querySelector("#container .pop-up");
    let op = 0.1;
    let timer = setInterval( () => {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}

const getResponseHtml = (text) => { // temporary pop up to let the user know if their point submission was successful
  const HTML = `<div class="pop-up"><h1>${text}</h1></div>`;

  document.querySelector("#container").insertAdjacentHTML("beforeend", HTML);
  fadeIn();

  setTimeout(() => {
    fadeOut();
  }, 4000);
}

const submitForm = (data, description) => {  // send form data to the N8N server
  let object = {};

  object["description"] = description; // add description since it was technically not part of the form itself
  object["difficulty"] = difficultyValue; // add difficulty since it was technically not part of the form itself
  
  data.forEach((value, key) => object[key] = value);

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
    console.log("data sent");
    getResponseHtml("Data sent successfully."); // inform the user that their data was sent

  }).catch(error => {
    console.error("Error:", error);
    getResponseHtml("There was an error and your data was not sent."); // inform the user that their data was not sent
  });
}

const createEventPinDisplay = (point) => { // creates the HTML for the user points
  return `<div class="event-point">
            <div class="top-bar">
              <h1>Ongoing event: ${point.Title}</h1>
            </div> 
            <p class="start">${point.StartTime} to ${point.EndTime}</p>
            <p class="description">${point.Description}</p>
          </div>`
}

const createUserPinDisplay = (point) => { // creates the HTML for the event points
  return `<div class="user-point">
            <div class="top-bar">
              <div class="circle">
                <h2 class="difficulty">${point.Difficulty}</h2>
              </div>
              <h1 class="location">${point.Location}</h1>
            </div>     
            <p class="description">${point.Description}</p>
          </div>`
}

const updateFormUI = (difficulty) => { // changes the colors of the difficult circles to match the one the user selected
  difficultyValue = parseInt(difficulty.substring(1));

  for (let i = 0; i < 5; i++) { // for all bubbles
    if (i < difficultyValue) { // if the value is less than or equal to the difficult the user selected (this is zero indexed but the point is given in nonzero index- hence < instead of <=)
      document.querySelector(`#d${i + 1}`).style.background = `${colorArray[difficultyValue - 1]}`; // set the background color to the selected difficulty
    } else { // if value is more than the difficulty value 
      document.querySelector(`#d${i + 1}`).style.background = `#fff`; // set the background color to white
    }
  }
}

const setFormPositioning = (form, x, y) => {
  let mapBounds = mapContainer.getBoundingClientRect();
  let formRect = form.getBoundingClientRect();

  form.style.top = `${y - (formRect.height / 2)}px`; // forms y center will be y

  if (x < (mapBounds.width / 2)) { // x is on the left half
    form.style.left = `${x + offsetFromPointToForm}px`; // form will be to the right of the point
  } else { // x is on the right half
    form.style.left = `${x - formRect.width - offsetFromPointToForm}px`; // form will be to the left of the point
  }

  let updatedFormRect = form.getBoundingClientRect();

  if (updatedFormRect.top < 0) { // if the top of the form is off the page
    form.style.top = `${y}px`; // the top of the form will be y
  }

  if (mapBounds.height < updatedFormRect.bottom) { // if the bottom of the form is off the page
    form.style.top = `${y - updatedFormRect.height}px`; // the bottom of the form will be y
  }
}

const createForm = (e) => { // creates the HTML for the form. the form has the points latitude and longitude hidden within it
  let marker = new mapboxgl.Marker().setLngLat([e.lngLat.lng, e.lngLat.lat]).addTo(map); // add a marker where the user wants to add a point
  marker._element.id = "temp-point";
  const form = document.createElement("form");
  form.id = "point-form";
  form.innerHTML = `<p>How difficult is this area to access or traverse: </p>
                    <br>
                    <div class="difficulty">
                      <h1>Easy</h1>
                      <div class="difficulty-select" id="d1"></div>
                      <div class="difficulty-select" id="d2"></div>
                      <div class="difficulty-select" id="d3"></div>
                      <div class="difficulty-select" id="d4"></div>
                      <div class="difficulty-select" id="d5"></div>
                      <h1>Hard</h1>
                    </div>

                    <label for="location">Location:</label>
                    <br>
                    <input type="text" id="location" name="location" required>
                    <br>
                    <label for="description">Description:</label>
                    <br>
                    <textarea name="text" id="description"></textarea>
                    <br>
                    <button type="submit">Submit</button>
                    <input type="hidden" id="long" name="long" value="${e.lngLat.lng}">
                    <input type="hidden" id="lat" name="lat" value="${e.lngLat.lat}">`;

  const container = document.querySelector("body #container");

  form.style.position = "absolute"; // place the form where the user clicks their mouse

  container.appendChild(form);

  setFormPositioning(form, e.point.x, e.point.y);

  document.querySelectorAll(".difficulty-select").forEach(difficulty => {
    difficulty.addEventListener("click", () => { 
      updateFormUI(difficulty.id);
    });
  });

  form.addEventListener("submit", (e) => { // on form submit
    e.preventDefault();
    let descriptionText = document.querySelector("form #description").value;
    if (difficultyValue != null || (descriptionText === "")) {
      submitForm(new FormData(form), descriptionText); // send to the airtable
      form.remove(); // remove the form from the DOM
      document.querySelector("#temp-point").remove(); // remove the temporary point
      menuOpen = false;
    }
  });
};