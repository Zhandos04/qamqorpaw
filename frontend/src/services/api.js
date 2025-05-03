import axios from 'axios';
import { API_URL } from '../config';

// Create an axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Pets API
export const petsApi = {
  // Get all pets with optional filters
  getAllPets: (params) => api.get('/pets/pets/', { params }),
  
  // Get pet details by ID
  getPetById: (id) => api.get(`/pets/pets/${id}/`),
  
  // Create a new pet
  createPet: (petData) => {
    const formData = new FormData();
    
    // Add all fields to formData
    Object.keys(petData).forEach(key => {
      if (key === 'photos') {
        petData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      } else if (petData[key] !== null && petData[key] !== undefined) {
        formData.append(key, petData[key]);
      }
    });
    
    return api.post('/pets/pets/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

updateReport: (id, reportData) => {
    const formData = new FormData();
    
    // Add all fields to formData
    Object.keys(reportData).forEach(key => {
      if (key === 'photos') {
        reportData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      } else if (key === 'existing_photos') {
        // Handle array of existing photo IDs
        reportData.existing_photos.forEach(photoId => {
          formData.append('existing_photos', photoId);
        });
      } else if (reportData[key] !== null && reportData[key] !== undefined) {
        formData.append(key, reportData[key]);
      }
    });
    
    return api.patch(`/pets/reports/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get report by ID
  getReportById: (id) => api.get(`/pets/reports/${id}/`),
  
  // Update a pet
  updatePet: (id, petData) => {
    const formData = new FormData();
    
    // Add all fields to formData
    Object.keys(petData).forEach(key => {
      if (key === 'photos') {
        petData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      } else if (petData[key] !== null && petData[key] !== undefined) {
        formData.append(key, petData[key]);
      }
    });
    
    return api.patch(`/pets/pets/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete a pet
  deletePet: (id) => api.delete(`/pets/pets/${id}/`),
  
  // Toggle favorite status
  toggleFavorite: (id) => api.post(`/pets/pets/${id}/favorite/`),
  
  // Get user's favorite pets
  getFavorites: () => api.get('/pets/pets/favorites/'),
  
  // Get user's owned pets
  getUserPets: () => api.get('/pets/pets/my_pets/'),
  
  // Get pet stats
  getPetStats: () => api.get('/pets/pets/stats/'),
  
  // Get all breeds
  getAllBreeds: (params) => api.get('/pets/breeds/', { params }),
  
  // Report a found pet
  reportPet: (reportData) => {
    const formData = new FormData();
    
    Object.keys(reportData).forEach(key => {
      if (key === 'photos') {
        reportData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      } else if (reportData[key] !== null && reportData[key] !== undefined) {
        formData.append(key, reportData[key]);
      }
    });
    
    return api.post('/pets/reports/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get all pet reports
  getAllReports: (params) => api.get('/pets/reports/', { params }),
  
  // Get report details by ID
  getReportById: (id) => api.get(`/pets/reports/${id}/`),
  
  // Get user's reports
  getUserReports: () => api.get('/pets/reports/my_reports/'),
  
  // Update report status
  updateReportStatus: (id, status) => api.post(`/pets/reports/${id}/change_status/`, { status }),
};

// Shelters API
export const sheltersApi = {
  // Get all shelters with optional filters
  getAllShelters: (params) => api.get('/shelters/shelters/', { params }),
  
  // Get shelter details by ID
  getShelterById: (id) => api.get(`/shelters/shelters/${id}/`),
  
  // Create a new shelter
  createShelter: (shelterData) => {
    const formData = new FormData();
    
    Object.keys(shelterData).forEach(key => {
      if (key === 'photos') {
        shelterData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      } else if (shelterData[key] !== null && shelterData[key] !== undefined) {
        formData.append(key, shelterData[key]);
      }
    });
    
    return api.post('/shelters/shelters/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update a shelter
  updateShelter: (id, shelterData) => {
    const formData = new FormData();
    
    Object.keys(shelterData).forEach(key => {
      if (key === 'photos') {
        shelterData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      } else if (shelterData[key] !== null && shelterData[key] !== undefined) {
        formData.append(key, shelterData[key]);
      }
    });
    
    return api.patch(`/shelters/shelters/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete a shelter
  deleteShelter: (id) => api.delete(`/shelters/shelters/${id}/`),
  
  // Get all cities
  getAllCities: (params) => api.get('/shelters/cities/', { params }),
  
  // Get user's owned shelters
  getUserShelters: () => api.get('/shelters/shelters/my_shelters/'),
  
  // Get shelter stats
  getShelterStats: () => api.get('/shelters/shelters/stats/'),
  
  // Get shelter pets
  getShelterPets: (id) => api.get(`/shelters/shelters/${id}/pets/`),
};

// Users API
export const usersApi = {
  // Get current user profile
  getCurrentUser: () => api.get('/users/me/'),
  
  // Update user profile
  updateProfile: (userData) => api.patch('/users/update_profile/', userData),
  
  // Get user's favorites
  getFavorites: () => api.get('/users/favorite_pets/'),
  
  // Get user's owned pets
  getOwnedPets: () => api.get('/users/owned_pets/'),
  
  // Get user's pet reports
  getPetReports: () => api.get('/users/pet_reports/'),
};

export default api;