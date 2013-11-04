function initHomePageMap() {

  // Enable the visual refresh
  google.maps.visualRefresh = true;

  var mapOptions = homePageMapOptions();
  var container = $('#map-canvas')[0];

  // map object, using options, which will be used to initialize.
  // (note map is declared at global scope (no 'var'), so support
  // functions can interact with it outside of initHomePageMap()
  map = new google.maps.Map(container, mapOptions);

  // Create a new marker where the user clicks
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  });
}


//
// Support functions:
//

function startingLatLong() {
  var loc = new google.maps.LatLng(39.73, -86.27);
  return loc;
}

function homePageMapOptions() {
  options = {
    center: startingLatLong(),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  return options;
};

function placeMarker(location) {
  var marker = new google.maps.Marker({
      position: location,
      map: map
  });
}