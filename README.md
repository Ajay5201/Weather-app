# 🌤️ Weather Application Backend

A robust, scalable weather application backend built with NestJS, featuring real-time weather data, city lookup capabilities, and user preference management.

## 🚀 Features

- **Weather Forecasting**: Get current, hourly (24h), and daily (5-day) weather data
- **City Lookup**: Intelligent city search with autocomplete functionality
- **User Preferences**: Save and manage favorite cities per session
- **Caching**: Redis-based caching for improved performance
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Error Handling**: Global exception handling with detailed logging
- **Health Monitoring**: Application health check endpoints
- **Scalable Architecture**: Modular design with clean separation of concerns

## 🛠️ Tech Stack

### **Core Framework**
- **NestJS v11**: Modern, scalable Node.js framework with TypeScript support
- **TypeScript v5.7**: Strong typing and modern JavaScript features

### **Database & Caching**
- **MongoDB**: NoSQL database for user preferences and session data
- **Mongoose**: MongoDB object modeling for Node.js
- **Redis**: In-memory caching for weather data and city search results

### **External APIs**
- **OpenWeatherMap API**: Weather data and forecasting
- **Geoapify API**: Geocoding and city search services

### **Development & Quality**
- **ESLint + Prettier**: Code quality and formatting
- **Jest**: Testing framework with coverage reporting
- **Swagger/OpenAPI**: API documentation and testing

### **Infrastructure**
- **Docker**: Containerization support
- **Environment Configuration**: Flexible configuration management
- **CORS**: Cross-origin resource sharing enabled

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd weather-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env
```

Configure your `.env` file with the following variables:
```env
# Application Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/weather-app

# API Keys
OPEN_WEATHER_API_KEY=your_openweather_api_key_here
GEO_APIFY_API_KEY=your_geoapify_api_key_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 4. Start Services
```bash
# Start MongoDB (if running locally)
mongod

# Start Redis (if running locally)
redis-server

# Start the application
npm run start:dev
```

### 5. Access the Application
- **API**: http://localhost:3000/api/v1
- **Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health-check

## 🏗️ Project Structure

```
src/
├── common/                 # Shared DTOs and decorators
├── constants/             # Application constants
├── core/                  # Core application modules
│   ├── database/         # Database configuration
│   ├── filters/          # Global exception filters
│   ├── guards/           # Authentication guards
│   └── interceptors/     # Response interceptors
├── modules/               # Feature modules
│   ├── city-lookup/      # City search functionality
│   ├── health/           # Health monitoring
│   ├── redis/            # Redis service
│   ├── user-preference/  # User preference management
│   └── weather/          # Weather data services
└── main.ts               # Application entry point
```

## 📚 API Documentation

### **Weather Endpoints**

#### Get Weather Forecast
```http
GET /api/v1/weather/{city}/forecast
```

**Response:**
```json
{
  "city": "London",
  "current": {
    "temperature": 18.5,
    "feelsLike": 17.2,
    "condition": "scattered clouds",
    "icon": "03d",
    "humidity": 65,
    "windSpeed": 3.2,
    "windDirection": "SW",
    "pressure": 1013,
    "sunrise": "2024-01-15T07:30:00.000Z",
    "sunset": "2024-01-15T16:45:00.000Z"
  },
  "hourly": [...],
  "daily": [...]
}
```

### **City Lookup Endpoints**

#### Search Cities
```http
GET /api/v1/city-lookup/search?query=london
```

### **User Preference Endpoints**

#### Add City to Preferences
```http
POST /api/v1/user/preferences
{
  "sessionId": "user-session-id",
  "city": "London"
}
```

#### Get User Preferences
```http
GET /api/v1/user/preferences/{sessionId}
```

#### Remove City from Preferences
```http
DELETE /api/v1/user/remove-city
{
  "sessionId": "user-session-id",
  "city": "London"
}
```

### **Health Check Endpoints**

#### Application Health
```http
GET /api/v1/health-check
```

## 🔧 Development

### **Available Scripts**
```bash
# Development
npm run start:dev          # Start in development mode
npm run start:debug        # Start with debugging

# Building
npm run build              # Build the application
npm run start:prod         # Start production build

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests
```

### **Code Style**
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Maintain consistent indentation (2 spaces)

## 🧪 Testing

### **Unit Tests**
```bash
npm run test
```

### **E2E Tests**
```bash
npm run test:e2e
```

### **Coverage Report**
```bash
npm run test:cov
```

## 🚀 Deployment

### **Environment Variables**
Ensure all required environment variables are set in production:
- `NODE_ENV=production`
- `MONGODB_URI`
- `OPEN_WEATHER_API_KEY`
- `GEO_APIFY_API_KEY`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### **Docker Deployment**
```bash
# Build the image
docker build -t weather-app .

# Run the container
docker run -p 3000:3000 weather-app
```

## 📊 Performance & Monitoring

### **Caching Strategy**
- **Weather Data**: 10 minutes TTL (OpenWeather API rate limits)
- **City Search**: 12 hours TTL (static geographic data)
- **User Preferences**: No expiration (user data)

### **Health Monitoring**
- Application health checks
- Database connectivity monitoring
- Redis connectivity monitoring
- External API health status

## 🔒 Security Considerations

### **Input Validation**
- All inputs are validated using class-validator
- SQL injection protection through Mongoose
- XSS protection through input sanitization

### **API Security**
- CORS enabled for cross-origin requests
- Rate limiting recommended for production
- API key validation for external services

## 🚧 Known Limitations

1. **API Rate Limits**: OpenWeather API has rate limits (1000 calls/day for free tier)
2. **Session Management**: Basic session-based user preferences (no authentication)
3. **Geographic Coverage**: Limited to cities supported by OpenWeather and Geoapify APIs
4. **Data Accuracy**: Weather data accuracy depends on OpenWeather API
5. **Cache Invalidation**: Manual cache TTL management

## 🚀 Future Improvements

### **Short Term (1-2 months)**
- [ ] Implement user authentication and authorization
- [ ] Add rate limiting middleware
- [ ] Implement WebSocket for real-time weather updates
- [ ] Add weather alerts and notifications
- [ ] Implement data validation middleware

### **Medium Term (3-6 months)**
- [ ] Add weather history and trends
- [ ] Implement multiple weather data providers
- [ ] Add weather maps and visualizations
- [ ] Implement push notifications
- [ ] Add weather widget generation

### **Long Term (6+ months)**
- [ ] Machine learning for weather prediction
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with IoT weather stations
- [ ] Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the health check endpoint for system status

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The web framework used
- [OpenWeatherMap](https://openweathermap.org/) - Weather data API
- [Geoapify](https://www.geoapify.com/) - Geocoding services
- [MongoDB](https://www.mongodb.com/) - Database solution
- [Redis](https://redis.io/) - Caching solution

---

**Built with ❤️ using NestJS and TypeScript**
