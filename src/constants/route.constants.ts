/**
 * API route constants
 */
export const ROUTES = {
 
  HEALTH_CHECK: {
    CONTROLLER: 'health-check', // Changed from 'users'
  },
  USER: {
    CONTROLLER: 'user', 
    GET_PREFERENCES: 'preferences/:sessionId',
    REMOVE_CITY: 'remove-city',
  },
  WEATHER: {
    CONTROLLER: 'weather', 
    GET_FORECAST: ':city/forecast',
  },
  
};
