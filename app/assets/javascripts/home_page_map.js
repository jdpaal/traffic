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

  //
  // Save a placed marker
  //
  $('.locations').on("click", ".save-location", function() {
    var
      $this = $(this),
      markerId = $(this).attr('marker-id');
    saveMarker(markerId);
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
  // Event listener for dragging new marker
  google.maps.event.addListener(marker, 'dragend', updateMarkerPosition);
  storeNewMarker(marker);
  showNewMarkerInList(marker);
}

//
// Fired after dragging a marker. Note that 'this' is
// the marker
//
function updateMarkerPosition(event) {
  var
    marker = this;
    id = marker.__gm_id,
    lat = marker.position.lat(),
    lng = marker.position.lng(),
    li = $('.locations').find("li[marker-id='"+ id +"']");

    li.find('.lat').text(lat);
    li.find('.lng').text(lng);
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
    lat = marker.position.lat(),
    lng = marker.position.lng(),
    id = marker.__gm_id,
    toShow = "Lat: <span class='lat'>" + lat + "</span>, Long: <span class='lng'>" + lng + "</span>";

  var removeButton = $('<a>')
    .attr('href','javascript:void(0)')
    .addClass('remove')
    .attr('marker-id', id)
    .text("Remove");

  var saveButton = $('<a>')
    .attr('href','javascript:void(0)')
    .addClass('save-location')
    .attr('marker-id', id)
    .text("Save");

  var newItem = $('<li>')
    .attr('marker-id', id)
    .html(toShow)
    .append('<br />')
    .append(removeButton)
    .append(" ")
    .append(saveButton);

  $('.locations').append(newItem);
}

//
// Removes a marker based on it's __gm_id
//
function removeMarker(id) {
  var marker = markers[id];
  marker.setMap(null);
}

//
// Saves a marker for the current user
//
function saveMarker(id) {
  var
    marker = markers[id],
    lat = marker.position.lat(),
    lng = marker.position.lng();
  var locationData = {
    lat: lat,
    lng: lng
  };

  $.ajax({
    type: "POST",
    url: "/locations",
    data: locationData,
    success: function(data) {
      alert("Saved!");
    },
    error: function(data) {
      alert("Error saving");
    },
    complete: function(data) {
      console.log("Save location complete");
    }
  });

}





