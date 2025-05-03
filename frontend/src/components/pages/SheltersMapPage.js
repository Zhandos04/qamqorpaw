import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ListIcon from '@mui/icons-material/List';
import MapIcon from '@mui/icons-material/Map';
import { sheltersApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Custom marker icons
const shelterIcon = new L.Icon({
  iconUrl: '/images/shelter-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const clinicIcon = new L.Icon({
  iconUrl: '/images/clinic-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const bothIcon = new L.Icon({
  iconUrl: '/images/both-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const SheltersMapPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shelters, setShelters] = useState([]);
  const [cities, setCities] = useState([]);
  const [tabValue, setTabValue] = useState(1); // Map tab selected
  const [filters, setFilters] = useState({
    shelter_type: '',
    city: '',
    is_verified: ''
  });
  
  // Default map center (Almaty)
  const [mapCenter, setMapCenter] = useState([43.2220, 76.8512]);
  const [mapZoom, setMapZoom] = useState(12);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all shelters
        const queryParams = { ...filters };
        
        // Remove empty filters
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === '') {
            delete queryParams[key];
          }
        });
        
        const [sheltersResponse, citiesResponse] = await Promise.all([
          sheltersApi.getAllShelters({ ...queryParams, limit: 100 }), // Get more results for the map
          sheltersApi.getAllCities()
        ]);
        
        setShelters(sheltersResponse.data.results || []);
        setCities(citiesResponse.data.results || []);
        
        // If city filter is selected, center map on that city
        if (filters.city && citiesResponse.data.results) {
          const selectedCity = citiesResponse.data.results.find(city => city.id === Number(filters.city));
          if (selectedCity && selectedCity.latitude && selectedCity.longitude) {
            setMapCenter([selectedCity.latitude, selectedCity.longitude]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      shelter_type: '',
      city: '',
      is_verified: ''
    });
    
    // Reset map view to Almaty
    setMapCenter([43.2220, 76.8512]);
    setMapZoom(12);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    if (newValue === 0) {
      // Navigate to list view
      navigate('/shelters');
    }
  };
  
  const getMarkerIcon = (shelterType) => {
    switch (shelterType) {
      case 'shelter':
        return shelterIcon;
      case 'clinic':
        return clinicIcon;
      case 'both':
        return bothIcon;
      default:
        return new L.Icon.Default();
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Shelters & Clinics Map
      </Typography>
      
      {/* View Switcher */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="view options"
        >
          <Tab icon={<ListIcon />} label="List" />
          <Tab icon={<MapIcon />} label="Map" />
        </Tabs>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                name="shelter_type"
                value={filters.shelter_type}
                label="Type"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="shelter">Shelter</MenuItem>
                <MenuItem value="clinic">Clinic</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="city-label">City</InputLabel>
              <Select
                labelId="city-label"
                name="city"
                value={filters.city}
                label="City"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Cities</MenuItem>
                {cities.map(city => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="verified-label">Verification</InputLabel>
              <Select
                labelId="verified-label"
                name="is_verified"
                value={filters.is_verified}
                label="Verification"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Verified</MenuItem>
                <MenuItem value="false">Unverified</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Map */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Box sx={{ height: '70vh', width: '100%' }}>
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {shelters.filter(shelter => shelter.latitude && shelter.longitude)
              .map(shelter => (
                <Marker 
                  key={shelter.id}
                  position={[shelter.latitude, shelter.longitude]}
                  icon={getMarkerIcon(shelter.shelter_type)}
                >
                  <Popup>
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {shelter.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {shelter.city_name}, {shelter.street}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {shelter.shelter_type === 'shelter' ? 'Pet Shelter' : 
                         shelter.shelter_type === 'clinic' ? 'Veterinary Clinic' : 
                         'Shelter & Clinic'}
                      </Typography>
                      {shelter.phone && (
                        <Typography variant="body2" gutterBottom>
                          Phone: {shelter.phone}
                        </Typography>
                      )}
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/shelters/${shelter.id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </Box>
      )}
      
      {/* Legend */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Map Legend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/images/shelter-marker.png" alt="Shelter" sx={{ width: 24, height: 24, mr: 1 }} />
            <Typography variant="body2">Pet Shelter</Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/images/clinic-marker.png" alt="Clinic" sx={{ width: 24, height: 24, mr: 1 }} />
            <Typography variant="body2">Veterinary Clinic</Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/images/both-marker.png" alt="Both" sx={{ width: 24, height: 24, mr: 1 }} />
            <Typography variant="body2">Shelter & Clinic</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SheltersMapPage;