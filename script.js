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

// coculate the difference between 2 points in a circle
function getDifference(point1, point2) {
  var dif = Math.abs * (point1 - point2);

  if (dif > 180) {
    dif = 360 - dif;
  }
  return dif;
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
var pov = { heading: 90, pitch: 0 };
// Start in Paris
var coords = { lat: 40.44460773097255, lng: -79.9445135945247 };
var preCoords = { lat: null, lng: null }

//get foward and back links
var fowardLinkPanoID;
var backLinkPanoID;

//foward and backward status
var fowardStatus = false;
var backwardStatus = false;


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
    fullscreenControl: true,
    linksControl: true
  });

  // Hook to communicate with the street view data provider service
  svService = new google.maps.StreetViewService();

    // Set the initial Street View camera to near the starting coordinates
  svService.getPanorama({ location: coords, radius: 10 }, processSVData);
  resizeStreetView()
}

function processSVData(data, status) {
  return new Promise((resolve, reject) => {
  console.log("processSVData");
  if (status === google.maps.StreetViewStatus.OK) {

    var adjacentLinks = data.links;

    //print data.links
    for (var i = 0; i < adjacentLinks.length; i++) {
      console.log(i, "is", adjacentLinks[i]);
    }

    var adjacentPov = pov;
    var sortedLinks = data.links;

    sortedLinks = adjacentLinks.map(function (link) {
      return {
        link: link,
        difference: getDifference(adjacentPov, link.heading)
      };
    }).sort(function (a, b) {
      return a.difference - b.difference;
    }).map(function (item) {
      return item.link;
    });


    for (var i = 0; i < sortedLinks.length; i++) {
      console.log(i, "sortedLinks is", sortedLinks[i], pov);
    }

    fowardLinkPanoID = sortedLinks[0].pano;
    console.log("fowardLinkPanoID_Heading", sortedLinks[0].heading);


    backLinkPanoID = sortedLinks[sortedLinks.length - 1].pano;
    console.log("backLinkPanoID_Heading", sortedLinks[sortedLinks.length - 1].heading);


    console.log("fowardLinkPanoID", fowardLinkPanoID);
    console.log("backLinkPanoID", backLinkPanoID);

    if (fowardStatus) {
      streetView.setPano(fowardLinkPanoID);
      streetView.setPov(sortedLinks[0].heading);
      fowardStatus = false;
      console.log("foward");

    }
    else if (backwardStatus) {
      streetView.setPano(backLinkPanoID);
      streetView.setPov(sortedLinks[sortedLinks.length - 1].heading);
      backwardStatus = false;
      console.log("backward");
    }
    else {
      streetView.setPano(data.location.pano);
      streetView.setPov(pov);
    }

/*    
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
*/
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
    console.log("w");
    fowardStatus = true;
    // var newCoords = getNewCoordinates(coords, pov.heading, 7);
    await new Promise((resolve, reject) => {
      svService.getPanorama({ pano: fowardLinkPanoID }, (data, status) => { 
        processSVData(data, status).then(resolve).catch(reject);
      });
    });
  }
  if (keyState.a) {
    // Handle A key
    pov.heading += 1;
    console.log("a + heading", pov);
  }
  if (keyState.s) {
    // Handle S key
    console.log("s");
    backwardStatus = true;
    // var newCoords = getNewCoordinates(coords, pov.heading, -7);
    await new Promise((resolve, reject) => {
      svService.getPanorama({ pano: backLinkPanoID }, (data, status) => {
        processSVData(data, status).then(resolve).catch(reject);
      });
    });
  }
  if (keyState.d) {
    // Handle D key
    pov.heading -= 1;
    console.log("d + heading", pov);
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

