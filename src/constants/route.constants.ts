/**
 * API route constants
 */
export const ROUTES = {
 
  HEALTH_CHECK: {
    CONTROLLER: ['/','health-check'], // Changed from 'users'
  },
  USER: {
    CONTROLLER: 'user', 
    GET_PREFERENCES: 'preferences/:sessionId',
    REMOVE_CITY: 'remove-city',
    ADD_CITY:'add-city'
  },
  WEATHER: {
    CONTROLLER: 'weather', 
    GET_FORECAST: ':city/forecast',
    GET_MULTIPLE_FORECAST_FOR_SESSION: 'multi-forecast-for-session',
  },
  CITY_LOOK_UP: {
    CONTROLLER: 'city-lookup', 
    SEARCH: 'search',
  },
  
};
