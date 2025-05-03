import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Rating,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { sheltersApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SheltersListTablePage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [shelters, setShelters] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0 for shelters, 1 for clinics
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  useEffect(() => {
    const fetchShelters = async () => {
      setLoading(true);
      
      try {
        const queryParams = {
          shelter_type: tabValue === 0 ? 'shelter' : 'clinic'
        };
        
        if (search) {
          queryParams.search = search;
        }
        
        const response = await sheltersApi.getAllShelters(queryParams);
        setShelters(response.data.results || []);
      } catch (error) {
        console.error('Error fetching shelters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShelters();
  }, [tabValue, search]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewChange = (mode) => {
    if (mode === 'map') {
      navigate('/shelters/map');
    } else {
      setViewMode('list');
    }
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const clearSearch = () => {
    setSearch('');
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled in useEffect
  };
  
  const handleShelterClick = (shelterId) => {
    navigate(`/shelters/${shelterId}`);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Shelters List
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="shelter types"
          centered
        >
          <Tab label="Shelters" />
          <Tab label="Clinics" />
        </Tabs>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<LocationOnIcon />}
            onClick={() => handleViewChange('list')}
            disabled={viewMode === 'list'}
          >
            Location
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<MapIcon />}
            onClick={() => handleViewChange('map')}
          >
            By Map
          </Button>
        </Box>
        
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: 'flex', width: '100%', maxWidth: 300 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search"
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
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Shelters</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contacts</TableCell>
              <TableCell>Work Hours</TableCell>
              <TableCell>Ratings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shelters.length > 0 ? (
              shelters.map((shelter) => (
                <TableRow
                  key={shelter.id}
                  hover
                  onClick={() => handleShelterClick(shelter.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{shelter.name}</TableCell>
                  <TableCell>{shelter.street}</TableCell>
                  <TableCell>{shelter.phone}</TableCell>
                  <TableCell>10:00 - 18:00, Sun: Closed</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating 
                        value={shelter.rating || 4.5} 
                        precision={0.5} 
                        readOnly 
                        size="small" 
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {shelter.rating || '4.5'}/5
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No shelters found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SheltersListTablePage;