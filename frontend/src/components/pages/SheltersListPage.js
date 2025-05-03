import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Pagination, 
  TextField, 
  InputAdornment, 
  IconButton,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import { sheltersApi } from '../../services/api';
import { getImageUrl } from '../../config';
import LoadingSpinner from '../common/LoadingSpinner';

const SheltersListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shelters, setShelters] = useState([]);
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    shelter_type: '',
    city: '',
    is_verified: ''
  });
  
  const fetchShelters = useCallback(async (pageNum = 1, searchQuery = search, currentFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pageNum,
        search: searchQuery,
        ...currentFilters
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const response = await sheltersApi.getAllShelters(queryParams);
      setShelters(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 20)); // Assuming 20 per page
    } catch (error) {
      console.error('Error fetching shelters:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchShelters();
        
        // Fetch cities for filters
        const citiesResponse = await sheltersApi.getAllCities();
        setCities(citiesResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [fetchShelters]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
    fetchShelters(value);
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchShelters(1, search);
  };
  
  const clearSearch = () => {
    setSearch('');
    setPage(1);
    fetchShelters(1, '');
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setPage(1);
    fetchShelters(1, search, newFilters);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    if (newValue === 1) {
      // Navigate to map view
      navigate('/shelters/map');
    }
  };
  
  // Get shelter image or use placeholder
  const getShelterImage = (shelter) => {
    if (shelter.photos && shelter.photos.length > 0) {
      return getImageUrl(shelter.photos[0].image);
    }
    return shelter.shelter_type === 'clinic' 
      ? '/images/clinic-placeholder.jpg' 
      : '/images/shelter-placeholder.jpg';
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Shelters & Clinics
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
      
      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ display: 'flex' }}
          >
            <TextField
              fullWidth
              placeholder="Search shelters..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button type="submit" variant="contained" sx={{ ml: 1 }}>
              Search
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
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
        
        <Grid item xs={12} sm={6} md={2}>
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
        
        <Grid item xs={12} sm={6} md={2}>
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
      </Grid>
      
      {/* Shelters Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : shelters.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {shelters.map(shelter => (
              <Grid item xs={12} sm={6} md={4} key={shelter.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={getShelterImage(shelter)}
                    alt={shelter.name}
                    className="shelter-card-image"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {shelter.name}
                      </Typography>
                      {shelter.is_verified && (
                        <Chip 
                          label="Verified" 
                          color="primary" 
                          size="small" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {shelter.city_name || 'Unknown location'}
                    </Typography>
                    
                    <Chip 
                      label={
                        shelter.shelter_type === 'shelter' ? 'Shelter' : 
                        shelter.shelter_type === 'clinic' ? 'Clinic' : 'Shelter & Clinic'
                      }
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {shelter.description 
                        ? (shelter.description.length > 100 
                            ? `${shelter.description.substring(0, 100)}...` 
                            : shelter.description)
                        : 'No description available.'}
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate(`/shelters/${shelter.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">
            No shelters found matching your criteria
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => {
              setFilters({
                shelter_type: '',
                city: '',
                is_verified: ''
              });
              setSearch('');
              fetchShelters(1, '', {
                shelter_type: '',
                city: '',
                is_verified: ''
              });
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SheltersListPage;