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
var coords = {lat: 48.8592236, lng: 2.2972824};

function initMap() {

  // Map panel
  map = new google.maps.Map(document.getElementById('map'), {
    center: coords,
    zoom: 15, // Reasonable zoom level for our requirements
    streetViewControl: false // No pegman button
  });
  map.setOptions({
    // disableDefaultUI: true,
    // draggable: false,
    // scrollwheel: false,
    // keyboardShortcuts: false,
    fullscreenControl: true
  });
  
  // Show valid Street View locations in a blue overlay on the map
  var streetViewLayer = new google.maps.StreetViewCoverageLayer();
  streetViewLayer.setMap(map);
  
  // Street view panel
  streetView = new google.maps.StreetViewPanorama(document.getElementById("streetView"));
  streetView.setZoom(0);
  streetView.setOptions({
    // disableDefaultUI: true, // Remove all controls: compass, zoom etc
    // scrollwheel: false, // Disable zooming using the scroll wheel
    // panControl: false,
    fullscreenControl: true
  });
  
  // Hook to communicate with the street view data provider service
  svService = new google.maps.StreetViewService();
  
  // Set the initial Street View camera to near the starting coordinates
  svService.getPanorama({location: coords, radius: 10}, processSVData);

}

function processSVData(data, status) {
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
    coords.lat = data.location.latLng.lat();
    coords.lng = data.location.latLng.lng();
  } else {
    console.error('Street View data not found for this location.');
  }
}

/*Main Function*/
function mainloop() {

  console.log(keyState);

  if (!streetView) {
    window.requestAnimationFrame(mainloop);
    return;
  }

  if (keyState.w) {
    // Handle W key
    var newCoords = getNewCoordinates(coords, pov.heading, 7);
    svService.getPanorama({ location: newCoords, radius: 10 }, processSVData);
  }
  if (keyState.a) {
    // Handle A key
    pov.heading += 1;
  }
  if (keyState.s) {
    // Handle S key
    var newCoords = getNewCoordinates(coords, pov.heading, -7);
    svService.getPanorama({ location: newCoords, radius: 10 }, processSVData);
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
  document.getElementById("wheel").style.transform = "rotate(" + (-pov.heading) + "deg)";

  // Simple map
  document.getElementById("map").style.transform = "rotate(" + pov.heading + "deg)";

  streetView.setPov(pov);

  window.requestAnimationFrame(mainloop);

}
