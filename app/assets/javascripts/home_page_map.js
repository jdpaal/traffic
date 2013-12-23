function initHomePageMap() {

  // Enable the visual refresh (newer google map UI)
  google.maps.visualRefresh = true;

  // Global variable for storing new markers
  markers = {}
  infoWindows = {}

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
    placeMarker({
      location: event.latLng
    });
  });

  //
  // Removes markers
  //
  $('.locations').on("click", ".remove", function() {
    var
      $this = $(this),
      markerId = $(this).attr('marker-id');
    removeMarkerFromMap(markerId);
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

  //
  // Clear map
  //
  $('.clear-map').click(function() {
    for(var markerId in markers) {
      removeMarkerFromMap(markerId);
    }
  })

  //
  // When viewing all locations, we initially only load the markers that exist
  // within the map's current view area. We want to also listen for the map's
  // bounds_changed event and then do two things:
  //
  // 1) Remove locations that are now out of view area
  // 2) TODO: load in any new locations that aren't in the view but need to be
  //
  google.maps.event.addListener(map,'bounds_changed', processBoundsChange);

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
// Create new marker and process it. Only required property of the data param
// is location. The other have defaults baked in to the logic below (icon image,
// draggable, etc)
//
// the metaData property is only present when the location has been loaded from
// the database. In this case the metaData is the entire json response for that
// location, so we can use it to get the owner id, and more.
//
function placeMarker(data) {
  var metaData = data.metaData || false;
  var marker = new google.maps.Marker({
      position: data.location,
      draggable: (data.draggable == undefined) ? true : data.draggable,
      animation: google.maps.Animation.DROP,
      map: map,
      icon: data.icon || "http://maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png"
  });
  // Event listener for dragging new marker
  google.maps.event.addListener(marker, 'dragend', updateMarkerPosition);

  // Event listener for clicking a marker to open an info window
  google.maps.event.addListener(marker, 'click', function() {
    setupMarkerInfoWindow(this, metaData);
  });

  // Save marker in a global so it can be referenced later by its ID
  addMarkerToGlobalVar(marker);

  // Render the marker to the view
  showNewMarkerInList(marker);

  updateMarkerLog();
}

//
// Fired after dragging a marker. Note that 'this' is the marker
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
// Fired after clicking a marker. Note that 'this' is the marker
//
function setupMarkerInfoWindow(marker, metaData) {
  var newInfoWindow;

  // If metaData is available, use it to fill this marker's info window.
  if (metaData) {
    newInfoWindow = new google.maps.InfoWindow({
      content: generateMarkerInfoWindowContent(marker, metaData)
    });
  } else {
    newInfoWindow = new google.maps.InfoWindow({
      content: unsavedLocationInfoWindowContent(),
    });
  }

  // Close all info windows that are in the global storage variable
  for(var infoWindowId in infoWindows) {
    infoWindows[infoWindowId].close()
  }

  // Open the new info window
  newInfoWindow.open(map,marker);

  // Add this info window to the global storage, using its ID as the property
  // key.
  infoWindows[newInfoWindow.anchor.__gm_id ] = newInfoWindow;

}

//
// Creates a reference to this new marker so we can
// easily look it up by its __gm_id and manipulate
// it later.
//
function addMarkerToGlobalVar(marker) {
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
// Removes a marker based on it's __gm_id from the map canvas
//
function removeMarkerFromMap(id) {
  var marker = markers[id];
  // Remove events associated with this marker (not 100% this does the trick)
  google.maps.event.clearInstanceListeners(marker);
  // Visually remove marker from map
  marker.setMap(null);
  // Remove marker details from text list on page
  removeMarkerDetailsFromList(id);
  // Delete the property from the global markers variable
  delete markers[id];
  // Not sure if this is needed...
  delete marker;

  updateMarkerLog();
}

//
// Removes the location details from the list of locations
//
function removeMarkerDetailsFromList(id) {
  $('.locations').find("li[marker-id='"+id+"']").remove();
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

//
// Upon clicking a marker, do a lookup for it's info window content
//
function generateMarkerInfoWindowContent(marker, metaData) {
  var
    metaData = metaData.replace(/&quot;/g,'\"'),
    metaData = JSON.parse(metaData).location,
    user_id = metaData.user_id;

  return '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h5 id="firstHeading" class="firstHeading">Loaded from database</h5>'+
    '<div id="bodyContent">'+
    '<p>Owned by user with <b>id: '+ user_id +'</b></p>'+
    '</div>'+
    '</div>';
}

//
// Info window content when users click on a marker that is not yet saved
//
function unsavedLocationInfoWindowContent() {
  return '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h5 id="firstHeading" class="firstHeading">Unsaved</h5>'+
    '<div id="bodyContent">'+
    '<p><b>Not yet saved</b>. Click save to save this location to the databse.</p>'+
    '</div>'+
    '</div>';
}

// When the bounds of the map change, we look to see if we can remove markers
// that are no longer in the view. We will also have to remove the events bound
// to them.
//
// TODO: add in markers that now need to be in the view
function processBoundsChange() {
  removeMarkersOutOfView();
  updateMarkerLog();
}

// Looks through markers and removes the ones that are out of view.
function removeMarkersOutOfView() {
  for(var markerId in markers) {
    if ( isMarkerOutOfBounds(markers[markerId]) ) {
      removeMarkerFromMap(markerId);
    }
  }
}

// Simple check to see if a marker is out of the map's current view area
// ("bounds")
function isMarkerOutOfBounds(marker) {
  var inView = map.getBounds().contains( marker.getPosition() );
  return !inView;
}

function updateMarkerLog() {
  var markersInObject = Object.keys(markers).length;
  $('.markers-count').text(markersInObject);
}

