const apiKey = process.env.GEOCODIO_KEY;
const fetch = require("node-fetch");

const geocodioRequest = async (address) => {
  const url = [
    'https://api.geocod.io/v1.3/geocode?q=',
    encodeURIComponent(address),
    '&api_key=',
    apiKey,
  ].join('');
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// const geocoder = async (city, state) => {
//   const key = `geocode_${city}_${state}`;
//   let coords = await localforage.getItem(key);
//   if (!coords) {
//     try {
//       const r = await geocodioRequest(`${city}, ${state}`);
//       coords = r.results[0].location;
//     } catch (err) {
//       // eslint-disable-next-line
//       console.log(err)
//       coords = { lat: 0, lng: 0 };
//     }
//     localforage.setItem(key, coords);
//   }
//   // console.log(coords)
//   return coords;
// };

module.exports = { geocoder: geocodioRequest }
