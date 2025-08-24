# 🌤️ Weather Application Backend

A robust, scalable weather application backend built with NestJS, featuring real-time weather data, city lookup capabilities, and user preference management.

## 🚀 Features

- **Weather Forecasting**: Get current, hourly (24h), and daily (5-day) weather data
- **City Lookup**: Intelligent city search with autocomplete functionality
- **User Preferences**: Save and manage favorite cities per session
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: Configurable API rate limiting
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Error Handling**: Global exception handling with detailed logging
- **Health Monitoring**: Application health check endpoints

## 🛠️ Tech Stack

### **NestJS + TypeScript**
- Modern Node.js framework with decorators and dependency injection
- Built-in validation, caching, and testing support
- Scalable architecture with modules

### **MongoDB**
- Flexible schema for user preferences and session data
- Fast queries for weather application data
- Easy horizontal scaling

### **Redis**
- In-memory caching reduces API calls to weather services
- Sub-millisecond response times for cached data
- Handles high concurrent requests efficiently

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+
- npm or yarn package manager

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd weather-app-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

```bash
cp env.example .env
```

Configure your `.env` file:

- **MongoDB**: Use local MongoDB or cloud service like MongoDB Atlas
- **Redis**: Use Redis Cloud or local Redis instance
- **OpenWeather API**: Get free API key from [openweathermap.org](https://openweathermap.org/api)
- **BBCI API**: Use provided key or get your own
- **Other settings**: Keep default values or adjust as needed

### 4. Setup Required Services

#### **MongoDB**
```bash
# Install MongoDB locally or use MongoDB Atlas (cloud)
mongod
```

#### **Redis**
```bash
# Use Redis Cloud (recommended) or install locally
redis-server
```

#### **Get API Keys**
- **OpenWeatherMap**: Sign up at openweathermap.org → API Keys
- **BBCI**: Use provided key or get your own

### 5. Start the Application
```bash
# Development mode
npm run start:dev
```

### 6. Verify Setup
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health-check

## 📚 API Documentation

**Swagger UI**: `http://localhost:3000/api/docs`

### **Main Endpoints**
- `GET /weather/{city}/forecast` - Weather forecast
- `GET /city-lookup/search?query={city}` - Search cities  
- `POST /user/preferences` - Save user city preferences
- `GET /user/preferences/{sessionId}` - Get saved cities
- `DELETE /user/remove-city` - Remove saved city
- `GET /weather/multi-forecast-for-session` - returns forecast deatils of all cities for a specific session


## 🏗️ Project Architecture

```
src/
├── common/                 # Shared DTOs and decorators
├── constants/             # Application constants
├── core/                  # Core application modules
│   ├── database/         # MongoDB configuration
│   ├── filters/          # Global exception filters
│   ├── guards/           # Authentication guards
│   └── interceptors/     # Response interceptors
├── modules/               # Feature modules
│   ├── city-lookup/      # City search functionality
│   ├── health/           # Health monitoring
│   ├── redis/            # Redis caching service
│   ├── user-preference/  # User preference management
│   └── weather/          # Weather data services
└── main.ts               # Application entry point
```

## 🤔 Assumptions Made

1. **Session-based users**: No authentication, users identified by session IDs
2. **Data freshness**: Weather data cached for 10 minutes is acceptable
3. **Geographic coverage**: Limited to OpenWeatherMap supported cities
4. **API reliability**: External weather APIs have good uptime
6. **Rate limits**: 100 requests per 15 minutes sufficient for typical usage

## 🚧 Known Limitations

1. **API Rate Limits**: OpenWeatherMap free tier limited to 1,000 calls/day
2. **No User Authentication**: Basic session-based preferences only
3. **Cache Management**: Simple TTL-based cache, no intelligent invalidation
5. **No Offline Support**: Requires internet connection
6. **Session Storage**: User data lost on server restart
7. **Geographic Limits**: Weather data limited to OpenWeatherMap database

## 🚀 Future Improvements

### **Short Term**
- [ ] User authentication with JWT
- [ ] WebSocket for real-time updates  
- [ ] Weather alerts and notifications
- [ ] Performance monitoring
- [ ] Machine learning weather predictions

## 📊 Performance Metrics

### **Caching Strategy**
- **Weather Data**: 10-minute TTL (balances freshness with API limits)
- **City Search**: 12-hour TTL (geographic data changes rarely)
- **User Preferences**: No expiration (user data persists until manual deletion)


## 🔒 Security Considerations

### **API Security**
- CORS enabled with configurable origins
- Rate limiting prevents API abuse
- API keys securely stored in environment variables
- No sensitive data logged in production


**Built with ❤️ using NestJS, MongoDB, and Redis**