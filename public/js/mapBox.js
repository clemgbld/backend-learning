/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2xlbWdibGQiLCJhIjoiY2w2YnBsanZ0MDIxdTNrcTY2cmptZXdsMyJ9.lZGbc-HVk0jEow-zP3o8GQ';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/clemgbld/cl6brkwjw002q14pa3vrdi65b', // style URL
  //   center: locations.coordinates, // starting position [lng, lat]
  //   zoom: 9, // starting zoom
  projection: 'globe', // display the map as a 3D globe
  scrollZoom: false,
});
map.on('style.load', () => {
  map.setFog({}); // Set the default atmosphere style
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  const el = document.createElement('div');
  el.className = 'marker';
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

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
