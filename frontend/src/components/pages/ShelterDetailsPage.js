import React, { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent,
  Avatar,
  Chip,
  Rating,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetCard from '../common/PetCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { sheltersApi } from '../../services/api';
import { getImageUrl } from '../../config';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shelter-tabpanel-${index}`}
      aria-labelledby={`shelter-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ShelterDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [shelter, setShelter] = useState(null);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchShelterData = async () => {
      setLoading(true);
      try {
        const [shelterResponse, petsResponse] = await Promise.all([
          sheltersApi.getShelterById(id),
          sheltersApi.getShelterPets(id)
        ]);
        
        setShelter(shelterResponse.data);
        setPets(petsResponse.data);
      } catch (error) {
        console.error('Error fetching shelter data:', error);
        setError('Failed to load shelter details. The shelter may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShelterData();
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error || !shelter) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Shelter not found'}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/shelters')}
          sx={{ mt: 2 }}
        >
          Back to Shelters
        </Button>
      </Box>
    );
  }
  
  const getShelterImage = () => {
    if (shelter.photos && shelter.photos.length > 0) {
      return getImageUrl(shelter.photos[0].image);
    }
    return shelter.shelter_type === 'clinic' 
      ? '/images/clinic-placeholder.jpg' 
      : '/images/shelter-placeholder.jpg';
  };
  
  return (
    <Box>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/shelters')}
        sx={{ mb: 3 }}
      >
        Back to Shelters
      </Button>
      
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={getShelterImage()}
                  alt={shelter.name}
                  variant="square"
                  sx={{ width: '100%', height: 'auto', aspectRatio: '1', mb: 2 }}
                />
                {shelter.is_verified && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <VerifiedIcon color="primary" />
                  </Box>
                )}
                <Button 
                  variant="outlined" 
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Choose Photo
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" component="h1">
                  {shelter.name}
                </Typography>
                {shelter.is_verified && (
                  <Chip 
                    icon={<VerifiedIcon />} 
                    label="Verified" 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 2 }} 
                  />
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Main Information
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {shelter.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {shelter.city_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {shelter.street}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Contacts
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {shelter.phone && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                        <PhoneIcon />
                      </IconButton>
                      <Typography variant="body1">
                        {shelter.phone}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {shelter.telegram && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                        <TelegramIcon />
                      </IconButton>
                      <Typography variant="body1">
                        @{shelter.telegram}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              
              <Typography variant="body1" paragraph>
                {shelter.description || 'No description provided.'}
              </Typography>
              
              {shelter.is_verified && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Reviews
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={4.8} precision={0.1} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      4.8 (32 reviews)
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="shelter tabs"
          >
            <Tab label="Profile" />
            <Tab label="Available Pets" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            About {shelter.name}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {shelter.description || 'No additional information provided about this shelter.'}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {shelter.street}, {shelter.city_name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {shelter.phone || 'Not provided'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {shelter.email || 'Not provided'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Available Pets
          </Typography>
          
          {pets.length > 0 ? (
            <Grid container spacing={3}>
              {pets.map(pet => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={pet.id}>
                  <PetCard pet={pet} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ py: 3, textAlign: 'center' }}>
              This shelter currently doesn't have any pets available for adoption.
            </Typography>
          )}
          
          {pets.length > 12 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button variant="outlined">
                Show More
              </Button>
            </Box>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ShelterDetailsPage;