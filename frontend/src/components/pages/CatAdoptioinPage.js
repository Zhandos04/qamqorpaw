import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Pagination, 
  Drawer,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  TextField,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PetCard from '../common/PetCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { petsApi, sheltersApi } from '../../services/api';

const CatAdoptionPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    breed: '',
    age_min: '',
    age_max: '',
    gender: '',
    size: '',
    city: '',
    is_free: false,
    vaccinated: '',
    sterilized: '',
    availability: ''
  });
  
  const fetchCats = useCallback(async (pageNum = 1, searchQuery = search, currentFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = {
        pet_type: 'cat',
        page: pageNum,
        search: searchQuery,
        ...currentFilters,
        // Convert boolean to string for API
        is_free: currentFilters.is_free ? 'true' : undefined
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });
      
      const response = await petsApi.getAllPets(queryParams);
      setCats(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 20)); // Assuming 20 per page
    } catch (error) {
      console.error('Error fetching cats:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch cats for first page
        await fetchCats();
        
        // Fetch breeds and cities for filters
        const [breedsResponse, citiesResponse] = await Promise.all([
          petsApi.getAllBreeds({ pet_type: 'cat' }),
          sheltersApi.getAllCities()
        ]);
        
        setBreeds(breedsResponse.data.results || []);
        setCities(citiesResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [fetchCats]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
    fetchCats(value);
  };
  
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    setPage(1);
    fetchCats(1, search, newFilters);
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCats(1, search);
  };
  
  const clearSearch = () => {
    setSearch('');
    setPage(1);
    fetchCats(1, '');
  };
  
  const clearFilters = () => {
    const resetFilters = {
      breed: '',
      age_min: '',
      age_max: '',
      gender: '',
      size: '',
      city: '',
      is_free: false,
      vaccinated: '',
      sterilized: '',
      availability: ''
    };
    setFilters(resetFilters);
    setPage(1);
    fetchCats(1, search, resetFilters);
  };
  
  const handleFavoriteToggle = (petId) => {
    setCats(cats.map(cat => 
      cat.id === petId ? { ...cat, is_favorite: !cat.is_favorite } : cat
    ));
  };
  
  const filterDrawer = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <Button color="primary" onClick={clearFilters}>Clear All</Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Breed</InputLabel>
        <Select
          value={filters.breed}
          label="Breed"
          onChange={(e) => handleFilterChange('breed', e.target.value)}
        >
          <MenuItem value="">All Breeds</MenuItem>
          {breeds.map(breed => (
            <MenuItem key={breed.id} value={breed.id}>{breed.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Typography variant="subtitle2" gutterBottom>Age (months)</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="Min"
            type="number"
            value={filters.age_min}
            onChange={(e) => handleFilterChange('age_min', e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Max"
            type="number"
            value={filters.age_max}
            onChange={(e) => handleFilterChange('age_max', e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
      </Grid>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Gender</InputLabel>
        <Select
          value={filters.gender}
          label="Gender"
          onChange={(e) => handleFilterChange('gender', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Size</InputLabel>
        <Select
          value={filters.size}
          label="Size"
          onChange={(e) => handleFilterChange('size', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="small">Small</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="large">Large</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>City</InputLabel>
        <Select
          value={filters.city}
          label="City"
          onChange={(e) => handleFilterChange('city', e.target.value)}
        >
          <MenuItem value="">All Cities</MenuItem>
          {cities.map(city => (
            <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Availability</InputLabel>
        <Select
          value={filters.availability}
          label="Availability"
          onChange={(e) => handleFilterChange('availability', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="for_adoption">For Adoption</MenuItem>
          <MenuItem value="foster_needed">Foster Needed</MenuItem>
          <MenuItem value="private_owner">Private Owner</MenuItem>
          <MenuItem value="shelter">Shelter</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Vaccinated</InputLabel>
        <Select
          value={filters.vaccinated}
          label="Vaccinated"
          onChange={(e) => handleFilterChange('vaccinated', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sterilized</InputLabel>
        <Select
          value={filters.sterilized}
          label="Sterilized"
          onChange={(e) => handleFilterChange('sterilized', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      </FormControl>
      
      <FormControlLabel
        control={
          <Checkbox
            checked={filters.is_free}
            onChange={(e) => handleFilterChange('is_free', e.target.checked)}
          />
        }
        label="Free pets only"
      />
      
      {isMobile && (
        <Button
          variant="contained"
          fullWidth
          onClick={() => setDrawerOpen(false)}
          sx={{ mt: 2 }}
        >
          Apply Filters
        </Button>
      )}
    </Box>
  );
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cat Adoption
      </Typography>
      
      <Grid container spacing={3}>
        {/* Filters - Desktop view */}
        {!isMobile && (
          <Grid item md={3}>
            {filterDrawer}
          </Grid>
        )}
        
        {/* Main content */}
        <Grid item xs={12} md={9}>
          {/* Search and filter bar */}
          <Box sx={{ display: 'flex', mb: 3, alignItems: 'center', gap: 2 }}>
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{ display: 'flex', flex: 1 }}
            >
              <TextField
                fullWidth
                placeholder="Search cats..."
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
            
            {isMobile && (
              <Button
                startIcon={<FilterListIcon />}
                variant="outlined"
                onClick={() => setDrawerOpen(true)}
              >
                Filters
              </Button>
            )}
          </Box>
          
          {/* Cats grid */}
          {loading ? (
            <LoadingSpinner />
          ) : cats.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {cats.map(cat => (
                  <Grid item xs={12} sm={6} md={4} key={cat.id}>
                    <PetCard 
                      pet={cat} 
                      onFavoriteToggle={handleFavoriteToggle} 
                    />
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
                No cats found matching your criteria
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }} 
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* Mobile filter drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {filterDrawer}
      </Drawer>
    </Box>
  );
};

export default CatAdoptionPage;