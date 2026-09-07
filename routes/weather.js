const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { validateCity } = require('../middleware/validation');

// Get current weather by city name
router.get('/current/:city', validateCity, weatherController.getCurrentWeather);

// Get weather by coordinates (latitude, longitude)
router.get('/coords', weatherController.getWeatherByCoords);

// Get forecast (5-day)
router.get('/forecast/:city', validateCity, weatherController.getForecast);

// Get multiple cities weather
router.post('/batch', weatherController.getBatchWeather);

module.exports = router;
