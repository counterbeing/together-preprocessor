const apiKey = process.env.GEOCODIO_KEY;
import fetch from 'node-fetch';

const geocoder = async (address) => {
  const url = [
    'https://api.geocod.io/v1.4/geocode?q=',
    encodeURIComponent(address),
    '&api_key=',
    apiKey,
  ].join('');
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export default geocoder;
