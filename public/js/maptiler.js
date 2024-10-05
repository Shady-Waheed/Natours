// Dom elements 
const mapTiler = document.getElementById('map')

// 
const displayMap = (locations) => {
  maptilersdk.config.apiKey = 'YExDCio1SPzRYHkzCi3Z';
  const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: 'streets-v2-light',
    scrollZoom: false,
    // center: [-118.113491,34.111745], // starting position [lng, lat]
    zoom: 1, // starting zoom
    // interactive: false,
    geolocateControl: false,
    navigationControl: false 
  });
  const bounds = new maptilersdk.LngLatBounds();
  
  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';
  
    // Add marker
    new maptilersdk.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
  
    // Add popup
    new maptilersdk.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
  
    // Extend the map bounds to include the current location
    bounds.extend(loc.coordinates);
  });
  
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });  
}

// 
// Delegation
if(mapTiler) {

  const locations = JSON.parse(mapTiler.dataset.locations);
  displayMap(locations);
}

