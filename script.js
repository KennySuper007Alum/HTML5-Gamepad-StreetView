var keyState = {
  w: false,
  a: false,
  s: false,
  d: false,
};


function keydownHandler(e) {
  switch (e.key) {
    case "w":
    case "W":
      keyState.w = true;
      break;
    case "a":
    case "A":
      keyState.a = true;
      break;
    case "s":
    case "S":
      keyState.s = true;
      break;
    case "d":
    case "D":
      keyState.d = true;
      break;
  }
}

function keyupHandler(e) {
  switch (e.key) {
    case "w":
    case "W":
      keyState.w = false;
      break;
    case "a":
    case "A":
      keyState.a = false;
      break;
    case "s":
    case "S":
      keyState.s = false;
      break;
    case "d":
    case "D":
      keyState.d = false;
      break;
  }
}

//up down left right botton
document.addEventListener("DOMContentLoaded", function () {
  // Get references to the up, left, down, and right buttons
  var upButton = document.getElementById("up");
  var leftButton = document.getElementById("left");
  var downButton = document.getElementById("down");
  var rightButton = document.getElementById("right");

  // Add click event listeners to the buttons
  upButton.addEventListener("mousedown", (e) => { keyState.w = true; e.preventDefault(); });
  upButton.addEventListener("touchstart", (e) => { keyState.w = true; e.preventDefault(); });
  leftButton.addEventListener("mousedown", (e) => { keyState.d = true; e.preventDefault(); });
  leftButton.addEventListener("touchstart", (e) => { keyState.d = true; e.preventDefault(); });
  downButton.addEventListener("mousedown", (e) => { keyState.s = true; e.preventDefault(); });
  downButton.addEventListener("touchstart", (e) => { keyState.s = true; e.preventDefault(); });
  rightButton.addEventListener("mousedown", (e) => { keyState.a = true; e.preventDefault(); });
  rightButton.addEventListener("touchstart", (e) => { keyState.a = true; e.preventDefault(); });

  // Add release event listeners to the buttons
  upButton.addEventListener("mouseup", (e) => { keyState.w = false; e.preventDefault(); });
  upButton.addEventListener("touchend", (e) => { keyState.w = false; e.preventDefault(); });
  leftButton.addEventListener("mouseup", (e) => { keyState.d = false; e.preventDefault(); });
  leftButton.addEventListener("touchend", (e) => { keyState.d = false; e.preventDefault(); });
  downButton.addEventListener("mouseup", (e) => { keyState.s = false; e.preventDefault(); });
  downButton.addEventListener("touchend", (e) => { keyState.s = false; e.preventDefault(); });
  rightButton.addEventListener("mouseup", (e) => { keyState.a = false; e.preventDefault(); });
  rightButton.addEventListener("touchend", (e) => { keyState.a = false; e.preventDefault(); });
});

/*Math Function*/
// Convert degrees to radians
function d2r(degrees) {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
function r2d(radians) {
  return radians * (180 / Math.PI);
}

// Calculate new coordinates given current coordinates, a heading, and a distance
function getNewCoordinates(coords, heading, distance) {

  // Current coordinates
  var lat = coords.lat;
  var lng = coords.lng;


  // Calculate deviation in meters
  var dx = Math.sin(d2r(heading)) * distance;
  var dy = Math.cos(d2r(heading)) * distance;
  
  // Calculate deviation in degrees lat/long
  var dlng = dx / (111111.1 * Math.cos(d2r(lat)));
  var dlat = dy / 111111.1;
  
  // Calculate new lat/long
  lat += dlat;
  lng += dlng;
  
  // Return new coordinate
  return {lat: lat, lng: lng};
}

function getPreviousCoordinates(preCoords) {
  var lat = preCoords.lat;
  var lng = preCoords.lng;
  return { lat: lat, lng: lng };
}

/*Initial Entry*/
document.addEventListener("keydown", keydownHandler, { passive: true });
document.addEventListener("keyup", keyupHandler, { passive: true });

// Register main update loop
window.requestAnimationFrame(mainloop);

// References to important JS objects
var map;
var streetView;
var svService;
var marker;
// Default view direction
var pov = {heading: 225, pitch: 0};
// Start in Paris
var coords = { lat: 40.44460774098271, lng: -79.9445135945241 };
var preCoords = { lat: null, lng: null }


function initMap() {

  // Map panel
  map = new google.maps.Map(document.getElementById('map'), {
    center: coords,
    zoom: 15, // Reasonable zoom level for our requirements
    streetViewControl: false // No pegman button
  });
  map.setOptions({
    disableDefaultUI: true,
    draggable: false,
    scrollwheel: false,
    keyboardShortcuts: false
  });
  
  // Show valid Street View locations in a blue overlay on the map
  var streetViewLayer = new google.maps.StreetViewCoverageLayer();
  streetViewLayer.setMap(map);
  
  // Street view panel
  streetView = new google.maps.StreetViewPanorama(document.getElementById("streetView"));
  streetView.setZoom(0);
  streetView.setOptions({
    disableDefaultUI: true, // Remove all controls: compass, zoom etc
    scrollwheel: false, // Disable zooming using the scroll wheel
    panControl: false,
    fullscreenControl: true
  });

  // Hook to communicate with the street view data provider service
  svService = new google.maps.StreetViewService();

    // Set the initial Street View camera to near the starting coordinates
  svService.getPanorama({ location: coords, preference: google.maps.StreetViewPreference.NEAREST, source: google.maps.StreetViewSource.OUTDOOR, radius: 10 }, processSVData);
  resizeStreetView()
}

function processSVData(data, status) {
  return new Promise((resolve, reject) => {
  console.log("processSVData");
  if (status === google.maps.StreetViewStatus.OK) {
    // Update street view with new location
    streetView.setPano(data.location.pano);

    streetView.setPov(pov);
    streetView.setVisible(true);
    
    var dot = {
      url: 'dot.png',
      size: new google.maps.Size(20, 20),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 10)
    };
    
    // Create or update map marker
    if(marker == null) {
      marker = new google.maps.Marker({
        position: data.location.latLng,
        map: map,
        clickable: true,
        icon: dot
      });
    } else {
      marker.setPosition(data.location.latLng);
    }
    
    // Update minimap to show new location
    map.panTo(data.location.latLng);

    // Update current coordinates
    preCoords.lat = coords.lat;
    preCoords.lng = coords.lng;
    
    // Update current coordinates
    coords.lat = data.location.latLng.lat();
    coords.lng = data.location.latLng.lng();
    resolve();
  } else {
    console.error('Street View data not found for this location.');
  }
  });
}

// Adjust the Street View panel size when the window size changes.
function resizeStreetView() {
  const streetView = document.getElementById("streetView");
  streetView.style.width = window.innerWidth + "px";
  streetView.style.height = window.innerHeight + "px";
  // Initialize the Street View when the panel is resized
}
// Add a listener to update the Street View panel size when the window is resized.
window.addEventListener("resize", resizeStreetView);

// Initialize the Street View when the page loads.
window.addEventListener("load", streetView);


/*Main Function*/
async function mainloop() {

  // console.log(keyState);

  if (!streetView) {
    window.requestAnimationFrame(mainloop);
    return;
  }

  if (keyState.w) {
    // Handle W key
    var newCoords = getNewCoordinates(coords, pov.heading, 7);
    await new Promise((resolve, reject) => {
      svService.getPanorama({ location: newCoords, preference: google.maps.StreetViewPreference.NEAREST, source: google.maps.StreetViewSource.OUTDOOR, radius: 10 }, (data, status) => {
        processSVData(data, status).then(resolve).catch(reject);
      });
    });
  }
  if (keyState.a) {
    // Handle A key
    pov.heading += 1;
  }
  if (keyState.s) {
    // Handle S key
    var newCoords = getNewCoordinates(coords, pov.heading, -7);
    await new Promise((resolve, reject) => {
      svService.getPanorama({ location: newCoords, preference: google.maps.StreetViewPreference.NEAREST, source: google.maps.StreetViewSource.OUTDOOR, radius: 10 }, (data, status) => {
        processSVData(data, status).then(resolve).catch(reject);
      });
    });
  }
  if (keyState.d) {
    // Handle D key
    pov.heading -= 1;
  }

  // Clamp pitch value to +/- 20 so you don't end up looking at your feet or the sky
  if (pov.pitch > 20) {
    pov.pitch = 20;
  }
  if (pov.pitch < -20) {
    pov.pitch = -20;
  }
  pov.pitch *= 0.95; // Automatically drift pitch back to level

  // Simple rotation of steering wheel based on controller input
  // document.getElementById("wheel").style.transform = "rotate(" + (-pov.heading) + "deg)";

  // Simple map
  document.getElementById("map").style.transform = "rotate(" + pov.heading + "deg)";

  streetView.setPov(pov);

  window.requestAnimationFrame(mainloop);

}
