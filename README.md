# Weather Dashboard

A real-time weather dashboard that fetches data from the OpenWeather API with an interactive web interface.

## Features

✅ **Real-time Weather Data**
- Current weather conditions for any city
- Temperature, humidity, wind speed, and more
- Weather descriptions with icons
- Sunrise and sunset times

✅ **5-Day Forecast**
- Daily weather predictions
- Temperature trends
- Precipitation data

✅ **Geolocation Support**
- Fetch weather based on user's current location
- One-click weather access

✅ **Performance Optimization**
- Server-side caching to reduce API calls
- Fast response times

✅ **Responsive Design**
- Mobile-friendly interface
- Works on all devices

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: OpenWeatherMap API
- **Caching**: node-cache
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenWeatherMap API key (free at https://openweathermap.org/api)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/leanne-spec/weather-dashboard.git
   cd weather-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenWeatherMap API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the dashboard**
   
   Open your browser and navigate to: `http://localhost:3000`

## API Endpoints

### Get Current Weather
```bash
GET /api/weather/current/:city
```
Example: `/api/weather/current/London?units=metric`

Query Parameters:
- `units`: `metric` (°C) or `imperial` (°F) - Default: `metric`

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "country": "GB",
    "temperature": 15.5,
    "feelsLike": 14.2,
    "humidity": 72,
    "pressure": 1013,
    "description": "scattered clouds",
    "icon": "03d",
    "wind": 4.1,
    "cloudiness": 40,
    "visibility": 10000,
    "sunrise": "2024-01-15T07:45:00.000Z",
    "sunset": "2024-01-15T16:30:00.000Z"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Get Weather by Coordinates
```bash
GET /api/weather/coords?lat=51.5074&lon=-0.1278&units=metric
```

### Get 5-Day Forecast
```bash
GET /api/weather/forecast/:city
```
Example: `/api/weather/forecast/Paris?units=metric`

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "Paris",
    "country": "FR",
    "forecast": [
      {
        "timestamp": "2024-01-16T12:00:00.000Z",
        "temperature": 12.3,
        "feelsLike": 11.0,
        "humidity": 65,
        "description": "few clouds",
        "icon": "02d",
        "wind": 3.5,
        "rain": 0
      }
      // ... more forecast entries
    ]
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Get Weather for Multiple Cities (Batch)
```bash
POST /api/weather/batch
Content-Type: application/json

{
  "cities": ["London", "Paris", "Tokyo"],
  "units": "metric"
}
```

### Health Check
```bash
GET /api/health
```

## File Structure

```
weather-dashboard/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   ├── styles.css         # Styling
│   └── script.js          # Frontend logic
├── routes/                # API routes
│   └── weather.js         # Weather endpoints
├── controllers/           # Request handlers
│   └── weatherController.js
├── services/              # Business logic
│   └── weatherService.js
├── middleware/            # Express middleware
│   ├── errorHandler.js    # Error handling
│   ├── validation.js      # Input validation
│   └── logger.js          # Logging utilities
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
└── README.md             # Documentation
```

## Usage Examples

### JavaScript Fetch API

```javascript
// Get current weather
fetch('/api/weather/current/Tokyo?units=metric')
  .then(res => res.json())
  .then(data => console.log(data));

// Get forecast
fetch('/api/weather/forecast/New York?units=imperial')
  .then(res => res.json())
  .then(data => console.log(data));

// Batch request
fetch('/api/weather/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cities: ['London', 'Berlin', 'Madrid'],
    units: 'metric'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### cURL Examples

```bash
# Current weather
curl "http://localhost:3000/api/weather/current/Singapore?units=metric"

# Forecast
curl "http://localhost:3000/api/weather/forecast/Sydney?units=metric"

# By coordinates
curl "http://localhost:3000/api/weather/coords?lat=40.7128&lon=-74.0060&units=metric"

# Batch
curl -X POST http://localhost:3000/api/weather/batch \
  -H "Content-Type: application/json" \
  -d '{"cities": ["Rome", "Athens", "Istanbul"], "units": "metric"}'
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `API_BASE_URL` | OpenWeather API base URL | https://api.openweathermap.org/data/2.5 |
| `CACHE_TTL` | Cache time-to-live in seconds | 600 |

### Cache Configuration

The application uses in-memory caching to reduce API calls. Adjust `CACHE_TTL` in `.env`:
- `600` (10 minutes) - Default
- `300` (5 minutes) - More frequent updates
- `1800` (30 minutes) - Less API calls

## Performance Tips

1. **API Rate Limiting**: Free OpenWeatherMap tier allows 60 calls/min
2. **Caching**: Results are cached server-side for 10 minutes by default
3. **Client-side**: Browser caching is handled automatically
4. **Database**: For production, consider adding a database for historical data

## Deployment

### Heroku

```bash
# Install Heroku CLI and login
heroku create weather-dashboard-app

# Set environment variables
heroku config:set OPENWEATHER_API_KEY=your_api_key

# Deploy
git push heroku main
```

### Docker

```bash
# Build
docker build -t weather-dashboard .

# Run
docker run -p 3000:3000 -e OPENWEATHER_API_KEY=your_key weather-dashboard
```

## Testing

```bash
# Run tests
npm test
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful request
- `400 Bad Request` - Invalid input
- `404 Not Found` - City/resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Troubleshooting

### Issue: "OPENWEATHER_API_KEY is not set"
- **Solution**: Add your API key to `.env` file

### Issue: "City not found"
- **Solution**: Check spelling and use full city names (e.g., "New York" instead of "NY")

### Issue: CORS errors
- **Solution**: CORS is enabled by default. If still experiencing issues, check proxy settings

### Issue: Slow responses
- **Solution**: Clear cache or increase `CACHE_TTL` in `.env`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Historical weather data tracking
- [ ] Multiple location comparison
- [ ] Weather alerts and notifications
- [ ] Dark/Light theme toggle
- [ ] Weather chart visualization
- [ ] Air quality index
- [ ] UV index information
- [ ] Database integration for data persistence
- [ ] User accounts and saved locations
- [ ] Mobile app (React Native)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
1. Open an issue on GitHub
2. Check existing documentation
3. Visit OpenWeatherMap API docs: https://openweathermap.org/api

## Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for the weather data API
- [Express.js](https://expressjs.com/) for the web framework
- [Node.js](https://nodejs.org/) community
