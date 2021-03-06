import {
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
  } from '../actions/types';
  
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    isLoading: true,
    user: null,
    error: null,
  };
  
  export default function (state = initialState, action) {
    switch (action.type) {
      case USER_LOADING:
        return {
          ...state,
          isLoading: true,
          error: null,
        };
      case USER_LOADED:
        return {
          ...state,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          user: action.payload,
        };
      case LOGIN_SUCCESS:
        localStorage.setItem('token', action.payload.token);
        return {
          ...state,
          ...action.payload,
          error: null,
          isAuthenticated: true,
          isLoading: false,
        };
      
      case LOGIN_FAIL:
        localStorage.removeItem('token');
        return {
          ...state,
          error: action.payload,
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        };

      case AUTH_ERROR:
      case LOGOUT_SUCCESS:
        localStorage.removeItem('token');
        return {
          ...state,
          error: null,
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        };
      default:
        return state;
    }
  }