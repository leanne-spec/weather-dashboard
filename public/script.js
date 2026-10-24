const API_BASE = '/api/weather';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

let activeRequest = 0;

function beginRequest() {
  const requestId = ++activeRequest;
  document.getElementById('forecastContainer').style.display = 'none';
  document.getElementById('forecastCards').innerHTML = '';
  hideError();
  showLoading(true);
  return requestId;
}

// Event listeners
searchBtn.addEventListener('click', () => searchWeather());
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchWeather();
});
locationBtn.addEventListener('click', useGeolocation);

// Search weather by city
async function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    showError('Please enter a city name');
    return;
  }
  
  const requestId = beginRequest();
  const encodedCity = encodeURIComponent(city);
  try {
    const weather = await fetchWeather(`${API_BASE}/current/${encodedCity}`, requestId);
    if (weather && requestId === activeRequest) {
      await fetchForecast(`${API_BASE}/forecast/${encodedCity}`, requestId);
    }
  } finally {
    if (requestId === activeRequest) showLoading(false);
  }
}

// Use geolocation
function useGeolocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser');
    return;
  }
  
  const requestId = beginRequest();
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      if (requestId !== activeRequest) return;
      const { latitude, longitude } = position.coords;
      await fetchWeather(`${API_BASE}/coords?lat=${latitude}&lon=${longitude}`, requestId);
      if (requestId === activeRequest) showLoading(false);
    },
    (error) => {
      if (requestId !== activeRequest) return;
      showLoading(false);
      showError('Unable to access your location: ' + error.message);
    }
  );
}

// Fetch weather data
async function fetchWeather(url, requestId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather not found');
    const result = await response.json();
    if (requestId !== activeRequest) return null;
    if (!result.success) throw new Error(result.error || 'Failed to fetch weather');
    displayWeather(result.data);
    return result.data;
  } catch (error) {
    if (requestId === activeRequest) showError(error.message);
    return null;
  }
}

// Fetch forecast data
async function fetchForecast(url, requestId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Unable to load the forecast. Please try again.');
    const result = await response.json();
    if (requestId !== activeRequest) return;
    if (!result.success) throw new Error(result.error || 'Failed to fetch forecast');
    displayForecast(result.data.forecast);
  } catch (error) {
    if (requestId === activeRequest) showError(error.message);
  }
}

// Display weather data
function displayWeather(weather) {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
  const lastUpdate = new Date(weather.sunrise);
  
  document.getElementById('cityName').textContent = `${weather.city}, ${weather.country}`;
  document.getElementById('lastUpdate').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  document.getElementById('weatherIcon').src = iconUrl;
  document.getElementById('temperature').textContent = `${Math.round(weather.temperature)}°C`;
  document.getElementById('description').textContent = weather.description;
  document.getElementById('feelsLike').textContent = `${Math.round(weather.feelsLike)}°C`;
  document.getElementById('humidity').textContent = `${weather.humidity}%`;
  document.getElementById('wind').textContent = `${weather.wind.toFixed(1)} m/s`;
  document.getElementById('pressure').textContent = `${weather.pressure} hPa`;
  document.getElementById('visibility').textContent = `${(weather.visibility / 1000).toFixed(1)} km`;
  document.getElementById('cloudiness').textContent = `${weather.cloudiness}%`;
  document.getElementById('sunrise').textContent = new Date(weather.sunrise).toLocaleTimeString();
  document.getElementById('sunset').textContent = new Date(weather.sunset).toLocaleTimeString();
}

// Display forecast
function displayForecast(forecast) {
  const forecastContainer = document.getElementById('forecastContainer');
  const forecastCards = document.getElementById('forecastCards');
  
  // Get forecast for every 24 hours (every 8 entries)
  const dailyForecast = forecast.filter((_, index) => index % 8 === 0).slice(0, 5);
  
  forecastCards.innerHTML = dailyForecast.map(day => `
    <div class="forecast-card">
      <div class="forecast-time">${new Date(day.timestamp).toLocaleDateString()}</div>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}" class="forecast-icon">
      <div class="forecast-temp">${Math.round(day.temperature)}°C</div>
      <div class="forecast-desc">${day.description}</div>
      ${day.rain > 0 ? `<div class="forecast-rain">🌧️ ${day.rain.toFixed(1)} mm</div>` : ''}
    </div>
  `).join('');
  
  forecastContainer.style.display = 'block';
}

// Utility functions
function showLoading(show) {
  loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}

// Initialize
console.log('Weather Dashboard loaded successfully');
