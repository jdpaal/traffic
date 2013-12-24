global = this

global.initHomePageMap = ->

  # Enable the visual refresh (newer google map UI)
  google.maps.visualRefresh = true

  # Global variable for storing new markers
  global.markers = {}
  global.infoWindows = {}
  mapOptions = homePageMapOptions()
  container = $("#map-canvas")[0]

  # map object, using options, which will be used to initialize.
  # (note map is declared at global scope (no 'var'), so support
  # functions can interact with it outside of initHomePageMap()
  global.map = new google.maps.Map(container, mapOptions)

  #-----------------------------
  # Event listeners for behavior
  #-----------------------------

  # Create a new marker where the user clicks. Only allow one unsaved marker at
  # a time. So we clear the marker with key "new" each time the user adds a new
  # one
  google.maps.event.addListener map, "click", (event) ->
    removeMarkerFromMap markers["new"] if markers["new"]
    placeMarker location: event.latLng

  #
  # Removes markers
  #
  $(".locations").on "click", ".remove", ->
    $this = $(this)
    locationId = $(this).attr("location-id")
    removeMarkerFromMap markers[locationId]

  #
  # Save a placed marker
  #
  $(".locations").on "click", ".save-location", ->
    $this = $(this)
    locationId = $(this).attr("location-id")
    saveMarker markers[locationId]

  #
  # Clear map
  #
  $(".clear-map").click ->
    for k,marker of markers
      removeMarkerFromMap marker


  #
  # When viewing all locations, we initially only load the markers that exist
  # within the map's current view area. We want to also listen for the map's
  # bounds_changed event and then do two things:
  #
  # 1) Remove locations that are now out of view area
  # 2) TODO: load in any new locations that aren't in the view but need to be
  #
  # It turns out the event "idle" is better than "bounds_changed" since the
  # latter fires too many times during a click and drag of the map.
  #
  # https://developers.google.com/maps/documentation/javascript/3.exp/reference#Map
  #
  google.maps.event.addListener map, "idle", processBoundsChange

# Ends initHomePageMap()

#--------------------
# Support functions
# -------------------

#
# Start centered over Indianapolis
#
startingLatLong = ->
  loc = new google.maps.LatLng(39.73, -86.27)
  loc

#
# Default options for map init
#
homePageMapOptions = ->
  options =
    center: startingLatLong()
    zoom: 8
    mapTypeId: google.maps.MapTypeId.ROADMAP
  options

#
# Create new marker and process it. Only required property of the data param
# is location. The other have defaults baked in to the logic below (icon image,
# draggable, etc)
#
# the metaData property is only present when the location has been loaded from
# the database. In this case the metaData is the entire json response for that
# location, so we can use it to get the owner id, and more.
#
global.placeMarker = (data) ->
  metaData = data.metaData or false

  # Don't re-add markers already on the map
  unless metaData and markerAlreadyInView(metaData)

    marker = new google.maps.Marker(
      position: data.location
      draggable: (if (data.draggable is `undefined`) then true else data.draggable)
      animation: google.maps.Animation.DROP
      map: map
      icon: data.icon or "http://maps.google.com/intl/en_us/mapfiles/ms/micons/yellow.png"
    )

    # If this location is loaded from db, we use it's ID in the database as the
    # id property of the marker. If it is not coming from the database then it is
    # a new, unsaved location and we give it the key "new".
    if metaData
      marker.id = propertyFromRubyResponse(metaData, "id")
    else
      marker.id = "new"

    # Event listener for dragging new marker
    google.maps.event.addListener marker, "dragend", updateMarkerPosition

    # Event listener for clicking a marker to open an info window
    google.maps.event.addListener marker, "click", ->
      setupMarkerInfoWindow this, metaData

    # Save marker in a global so it can be referenced later by its ID
    addMarkerToGlobalVar marker, metaData

    # Render the marker to the view
    showNewMarkerInList marker
    updateMarkerLog()

#
# Check to see if a given marker is already shown in the view. We do this by
# seeing if our global object markers has a key/value for the key markerId
#
markerAlreadyInView = (metaData) ->
  markerId = propertyFromRubyResponse(metaData, "id")
  markerId of markers

#
# Fired after dragging a marker. Note that 'this' is the marker.
#
updateMarkerPosition = (event) ->
  marker = this
  locationId = marker.id
  lat = marker.position.lat()
  lng = marker.position.lng()
  li = $(".locations").find("li[location-id='" + locationId + "']")

  li.find(".lat").text lat
  li.find(".lng").text lng

#
# Fired after clicking a marker. Note that 'this' is the marker
#
setupMarkerInfoWindow = (marker, metaData) ->
  newInfoWindow = undefined

  # If metaData is available, use it to fill this marker's info window.
  if metaData
    newInfoWindow = new google.maps.InfoWindow(content: generateMarkerInfoWindowContent(marker, metaData))
  else
    newInfoWindow = new google.maps.InfoWindow(content: unsavedLocationInfoWindowContent())

  # Close all info windows that are in the global storage variable
  for infoWindowId,windows of infoWindows
    infoWindows[infoWindowId].close()

  # Open the new info window
  newInfoWindow.open map, marker

  # Add this info window to the global storage, using its ID as the property
  # key.
  infoWindows[newInfoWindow.anchor.__gm_id] = newInfoWindow

#
# Creates a reference to this new marker so we can easily look it up later. If
# there is metaData from rails, we use the location's ID. Otherwise we use
# the string "new" as the property key, since only one new location can be
# on the map at once.
#
addMarkerToGlobalVar = (marker, metaData) ->
  if metaData
    id = propertyFromRubyResponse(metaData, "id")
    markers[id] = marker
  else
    markers["new"] = marker

#
# Show, visually, the new markers coordinants and a
# remove link.
#
showNewMarkerInList = (marker) ->
  lat = marker.position.lat()
  lng = marker.position.lng()
  locationId = marker.id || "new"
  toShow = "Lat: <span class='lat'>" + lat + "</span>, Long: <span class='lng'>" + lng + "</span>"
  removeButton = $("<a>").attr("href", "javascript:void(0)").addClass("remove").attr("location-id", locationId).text("Remove")
  saveButton = $("<a>").attr("href", "javascript:void(0)").addClass("save-location").attr("location-id", locationId).text("Save")
  newItem = $("<li>").attr("location-id", locationId).html(toShow).append("<br />").append(removeButton).append(" ").append(saveButton)
  $(".locations").append newItem

#
# Removes a marker based on it's locationID from the map canvas
#
removeMarkerFromMap = (marker) ->

  # Remove events associated with this marker (not 100% this does the trick)
  google.maps.event.clearInstanceListeners marker

  # Visually remove marker from map
  marker.setMap null

  # Remove marker details from text list on page
  removeMarkerDetailsFromList marker

  # Delete the property from the global markers variable
  delete markers[marker.id]

  # Not sure if this is needed...
  # delete marker

  updateMarkerLog()

#
# Removes the location details from the list of locations. We do a find by
# both geo and mg_id to catch some cases where the we need to remove a marker
# after it has been moved around the map.
#
removeMarkerDetailsFromList = (marker) ->
  $(".locations").find("li[location-id='" + marker.id + "']").remove()

#
# Saves a marker for the current user
#
saveMarker = (marker) ->
  lat = marker.position.lat()
  lng = marker.position.lng()
  locationData =
    lat: lat
    lng: lng

  $.ajax
    type: "POST"
    url: "/locations"
    data: locationData
    success: (data) ->
      console.log "Saved new location"
      marker.setIcon("http://labs.google.com/ridefinder/images/mm_20_red.png")

    error: (data) ->
      alert "Error saving"

    complete: (data) ->
      console.log "Save location complete"

#
# Upon clicking a marker, do a lookup for it's info window content
#
generateMarkerInfoWindowContent = (marker, metaData) ->
  markerId = marker.id
  user_id = propertyFromRubyResponse(metaData, "user_id")
  "<div id=\"content\"><div id=\"siteNotice\"></div>
  <h5 id=\"firstHeading\" class=\"firstHeading\">Loaded from database</h5>
  <div id=\"bodyContent\"><p>Owned by user with <b>id: #{user_id}</b><br/>
  Location id: #{markerId}</p>
  </div></div>"

#
# Gets the location property from the ruby response that comes from the rails
# action.
#
propertyFromRubyResponse = (metaData, prop) ->
  metaData = metaData.replace(/&quot;/g, "\"")
  metaData = JSON.parse(metaData).location
  metaData[prop]

#
# Info window content when users click on a marker that is not yet saved
#
unsavedLocationInfoWindowContent = ->
  "<div id=\"content\"><div id=\"siteNotice\"></div>
  <h5 id=\"firstHeading\" class=\"firstHeading\">Unsaved</h5><div id=\"bodyContent\">
  <p><b>Not yet saved</b>. Click save to save this location to the databse.</p></div></div>"

# When the bounds of the map change, we look to see if we can remove markers
# that are no longer in the view. We will also have to remove the events bound
# to them.
#
# TODO: add in markers that now need to be in the view
processBoundsChange = ->
  removeMarkersOutOfView()
  addMarkersNowInView()
  updateMarkerLog()

# Looks through markers and removes the ones that are out of view.
removeMarkersOutOfView = ->
  for k,marker of markers
    removeMarkerFromMap marker if isMarkerOutOfBounds(marker)

# Gets locations and adds the ones that need to be included in the map view
# after the map bounds change (pan/zoom)
addMarkersNowInView = ->
  $.ajax
    type: "GET"
    url: "/locations/all"
    success: (data) ->
      console.log "Success addMarkersNowInView"
    error: (data) ->
      alert "Error addMarkersNowInView"
    complete: (data) ->
      console.log "Done addMarkersNowInView"

# Simple check to see if a marker is out of the map's current view area
# ("bounds")
isMarkerOutOfBounds = (marker) ->
  inView = map.getBounds().contains(marker.getPosition())
  not inView
updateMarkerLog = ->
  markersInObject = Object.keys(markers).length
  $(".markers-count").text markersInObject