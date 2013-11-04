function initHomePageMap() {

  // Enable the visual refresh (newer google map UI)
  google.maps.visualRefresh = true;

  // Global variable for storing new markers
  markers = {}

  var mapOptions = homePageMapOptions();
  var container = $('#map-canvas')[0];

  // map object, using options, which will be used to initialize.
  // (note map is declared at global scope (no 'var'), so support
  // functions can interact with it outside of initHomePageMap()
  map = new google.maps.Map(container, mapOptions);

  //-----------------------------
  // Event listeners for behavior
  //-----------------------------

  // Create a new marker where the user clicks
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  });

  //
  // Removes markers
  //
  $('.locations').on("click", ".remove", function() {
    var
      $this = $(this),
      markerId = $(this).attr('marker-id');
    removeMarker(markerId);
    $this.closest('li').remove();
  })

// Ends initHomePageMap()
}


//--------------------
// Support functions
// -------------------

//
// Start centered over Indianapolis
//
function startingLatLong() {
  var loc = new google.maps.LatLng(39.73, -86.27);
  return loc;
}

//
// Default options for map init
//
function homePageMapOptions() {
  options = {
    center: startingLatLong(),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  return options;
};

//
// Create new marker and process it
//
function placeMarker(location) {
  var marker = new google.maps.Marker({
      position: location,
      draggable:true,
      animation: google.maps.Animation.DROP,
      map: map
  });
  storeNewMarker(marker);
  showNewMarkerInList(marker);
}

//
// Creates a reference to this new marker so we can
// easily look it up by its __gm_id and manipulate
// it later.
//
function storeNewMarker(marker) {
  var id = marker.__gm_id;
  markers[id] = marker;
}

//
// Show, visually, the new markers coordinants and a
// remove link.
//
function showNewMarkerInList(marker) {
  var
    lat = marker.position.lb,

    lng = marker.position.mb,

    id = marker.__gm_id,

    toShow = "Lat: " + lat + ", Long: " + lng,

    removeButton = $('<a>')
    .attr('href','javascript:void(0)')
    .addClass('remove')
    .attr('marker-id', id)
    .text("Remove"),

    newItem = $('<li>')
    .text(toShow)
    .append('<br />')
    .append(removeButton);

  $('.locations').append(newItem);
}

//
// Removes a marker based on it's __gm_id
//
function removeMarker(id) {
  marker = markers[id];
  marker.setMap(null);
}



