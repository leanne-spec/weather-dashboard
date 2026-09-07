const weatherService = require('../services/weatherService');
const { logRequest } = require('../middleware/logger');

// Get current weather for a city
exports.getCurrentWeather = async (req, res, next) => {
  try {
    logRequest(`Fetching weather for ${req.params.city}`);
    const { city } = req.params;
    const { units = 'metric' } = req.query;
    
    const weather = await weatherService.getCurrentWeather(city, units);
    
    res.json({
      success: true,
      data: weather,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get weather by coordinates
exports.getWeatherByCoords = async (req, res, next) => {
  try {
    const { lat, lon, units = 'metric' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }
    
    const weather = await weatherService.getWeatherByCoords(lat, lon, units);
    
    res.json({
      success: true,
      data: weather,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get 5-day forecast
exports.getForecast = async (req, res, next) => {
  try {
    logRequest(`Fetching forecast for ${req.params.city}`);
    const { city } = req.params;
    const { units = 'metric' } = req.query;
    
    const forecast = await weatherService.getForecast(city, units);
    
    res.json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get weather for multiple cities
exports.getBatchWeather = async (req, res, next) => {
  try {
    const { cities, units = 'metric' } = req.body;
    
    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({ 
        error: 'Cities must be an array' 
      });
    }
    
    const weatherData = await weatherService.getBatchWeather(cities, units);
    
    res.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
