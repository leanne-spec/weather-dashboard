const axios = require('axios');
const NodeCache = require('node-cache');
const { logError } = require('../middleware/logger');

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 600 });
const API_KEY = process.env.OPENWEATHER_API_KEY;
const API_BASE = process.env.API_BASE_URL || 'https://api.openweathermap.org/data/2.5';

if (!API_KEY) {
  throw new Error('OPENWEATHER_API_KEY is not set in environment variables');
}

const instance = axios.create({
  baseURL: API_BASE,
  timeout: 5000
});

// Get current weather
exports.getCurrentWeather = async (city, units = 'metric') => {
  const cacheKey = `weather_${city}_${units}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  try {
    const response = await instance.get('/weather', {
      params: {
        q: city,
        units: units,
        appid: API_KEY
      }
    });
    
    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      wind: response.data.wind.speed,
      cloudiness: response.data.clouds.all,
      visibility: response.data.visibility,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000)
    };
    
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    logError(`Error fetching weather for ${city}: ${error.message}`);
    throw new Error(`Failed to fetch weather for ${city}`);
  }
};

// Get weather by coordinates
exports.getWeatherByCoords = async (lat, lon, units = 'metric') => {
  const cacheKey = `weather_${lat}_${lon}_${units}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  try {
    const response = await instance.get('/weather', {
      params: {
        lat: lat,
        lon: lon,
        units: units,
        appid: API_KEY
      }
    });
    
    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      wind: response.data.wind.speed,
      cloudiness: response.data.clouds.all
    };
    
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    logError(`Error fetching weather for coords ${lat},${lon}: ${error.message}`);
    throw new Error('Failed to fetch weather for coordinates');
  }
};

// Get 5-day forecast
exports.getForecast = async (city, units = 'metric') => {
  const cacheKey = `forecast_${city}_${units}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  try {
    const response = await instance.get('/forecast', {
      params: {
        q: city,
        units: units,
        appid: API_KEY
      }
    });
    
    const forecast = response.data.list.map(item => ({
      timestamp: new Date(item.dt * 1000),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      wind: item.wind.speed,
      rain: item.rain?.['3h'] || 0
    }));
    
    const data = {
      city: response.data.city.name,
      country: response.data.city.country,
      forecast: forecast
    };
    
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    logError(`Error fetching forecast for ${city}: ${error.message}`);
    throw new Error(`Failed to fetch forecast for ${city}`);
  }
};

// Get weather for multiple cities
exports.getBatchWeather = async (cities, units = 'metric') => {
  const results = await Promise.allSettled(
    cities.map(city => exports.getCurrentWeather(city, units))
  );
  
  return results.map((result, index) => ({
    city: cities[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
};
