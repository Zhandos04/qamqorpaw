import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);
  
  const getUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
      setLoading(false);
    }
  };
  
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/token/login/`, {
        username,
        password
      });
      const newToken = response.data.auth_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const register = async (userData) => {
    try {
      await axios.post(`${API_URL}/api/auth/users/`, userData);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };
  
  const updateProfile = async (userData) => {
    try {
      const response = await axios.patch(`${API_URL}/api/users/update_profile/`, userData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setCurrentUser(response.data);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };
  
  const isAuthenticated = !!token;
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};