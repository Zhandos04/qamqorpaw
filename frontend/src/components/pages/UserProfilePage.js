import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Avatar, 
  Tabs, 
  Tab, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { usersApi, sheltersApi } from '../../services/api';
import PetCard from '../common/PetCard';
import LoadingSpinner from '../common/LoadingSpinner';

const UserProfilePage = () => {
  const { currentUser, isAuthenticated, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // User profile data that can be updated
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile: {
      phone: '',
      city: ''
    }
  });
  
  // User's pets and favorites
  const [ownedPets, setOwnedPets] = useState([]);
  const [favoritePets, setFavoritePets] = useState([]);
  const [petReports, setPetReports] = useState([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }
    
    // Fetch city data for dropdown
    const fetchCities = async () => {
      try {
        const response = await sheltersApi.getAllCities();
        setCities(response.data.results || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    
    fetchCities();
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (currentUser) {
      // Initialize form with user data
      setProfileData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        profile: {
          phone: currentUser.profile?.phone || '',
          city: currentUser.profile?.city || ''
        }
      });
      
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const [ownedResponse, favoritesResponse, reportsResponse] = await Promise.all([
            usersApi.getOwnedPets(),
            usersApi.getFavorites(),
            usersApi.getPetReports()
          ]);
          
          setOwnedPets(ownedResponse.data);
          setFavoritePets(favoritesResponse.data);
          setPetReports(reportsResponse.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [currentUser]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('profile.')) {
      const profileField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      setProfileData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        profile: {
          phone: currentUser.profile?.phone || '',
          city: currentUser.profile?.city || ''
        }
      });
    }
    
    setIsEditing(!isEditing);
  };
  
  const handleProfileUpdate = async () => {
    setSaveLoading(true);
    setErrorMessage('');
    
    try {
      const success = await updateProfile(profileData);
      
      if (success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleFavoriteToggle = (petId) => {
    setFavoritePets(favoritePets.filter(pet => pet.id !== petId));
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        {/* User Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={currentUser?.profile?.photo}
                alt={currentUser?.username}
                sx={{ width: 150, height: 150, mb: 2 }}
                className="user-avatar"
              >
                {currentUser?.first_name?.[0] || currentUser?.username?.[0]?.toUpperCase()}
              </Avatar>
              
              <Typography variant="h5">
                {currentUser?.first_name && currentUser?.last_name
                  ? `${currentUser.first_name} ${currentUser.last_name}`
                  : currentUser?.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                @{currentUser?.username}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}
            
            <Box>
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="profile.phone"
                      value={profileData.profile.phone}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="city-label">City</InputLabel>
                      <Select
                        labelId="city-label"
                        id="city"
                        name="profile.city"
                        value={profileData.profile.city}
                        label="City"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {cities.map(city => (
                          <MenuItem key={city.id} value={city.id}>
                            {city.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={handleEditToggle}
                      disabled={saveLoading}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleProfileUpdate}
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Email:</strong> {currentUser?.email}
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    <strong>Phone:</strong> {currentUser?.profile?.phone || 'Not provided'}
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    <strong>City:</strong> {currentUser?.profile?.city_name || 'Not provided'}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleEditToggle}
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Tabs Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="profile tabs"
              >
                <Tab label="Favorites" />
                <Tab label="My Pets" />
                <Tab label="Pet Reports" />
              </Tabs>
            </Box>
            
            {/* Favorites Tab */}
            <TabPanel value={tabValue} index={0}>
              {favoritePets.length > 0 ? (
                <Grid container spacing={3}>
                  {favoritePets.map(pet => (
                    <Grid item xs={12} sm={6} md={6} key={pet.id}>
                      <PetCard 
                        pet={pet}
                        isFavorite={true}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't added any pets to your favorites yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/dogs')}
                  >
                    Browse Pets
                  </Button>
                </Box>
              )}
            </TabPanel>
            
            {/* My Pets Tab */}
            <TabPanel value={tabValue} index={1}>
              {ownedPets.length > 0 ? (
                <Grid container spacing={3}>
                  {ownedPets.map(pet => (
                    <Grid item xs={12} sm={6} md={6} key={pet.id}>
                      <PetCard pet={pet} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't added any pets yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => alert('Add pet functionality would be implemented here')}
                  >
                    Add a Pet
                  </Button>
                </Box>
              )}
            </TabPanel>
            
            {/* Pet Reports Tab */}
            <TabPanel value={tabValue} index={2}>
              {petReports.length > 0 ? (
                <Grid container spacing={3}>
                  {petReports.map(report => (
                    <Grid item xs={12} key={report.id}>
                      <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4} md={3}>
                            {report.photos && report.photos.length > 0 ? (
                              <Box
                                component="img"
                                src={report.photos[0].image}
                                alt={`Reported ${report.pet_type}`}
                                sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 1 }}
                              />
                            ) : (
                              <Box
                                sx={{ 
                                  width: '100%', 
                                  height: 140, 
                                  bgcolor: 'grey.200',
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">
                                  No Image
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={8} md={9}>
                            <Typography variant="h6">
                              {report.name || `Unnamed ${report.pet_type === 'dog' ? 'Dog' : 'Cat'}`}
                              {report.is_stray && (
                                <Typography 
                                  component="span" 
                                  variant="caption" 
                                  sx={{ ml: 1, bgcolor: 'secondary.light', px: 1, py: 0.5, borderRadius: 1 }}
                                >
                                  Stray
                                </Typography>
                              )}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {report.breed_name || 'Unknown breed'}, {report.color}
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              <strong>Location:</strong> {report.city_name}, {report.street}
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              <strong>Status:</strong>{' '}
                              <Typography 
                                component="span" 
                                variant="caption" 
                                sx={{ 
                                  bgcolor: 
                                    report.status === 'approved' ? 'success.light' : 
                                    report.status === 'rejected' ? 'error.light' : 
                                    report.status === 'resolved' ? 'info.light' : 'warning.light',
                                  px: 1, 
                                  py: 0.5, 
                                  borderRadius: 1 
                                }}
                              >
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </Typography>
                            </Typography>
                            
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {report.description || 'No description provided.'}
                            </Typography>
                            
                            <Button 
                              variant="outlined" 
                              size="small" 
                              sx={{ mt: 1 }}
                              onClick={() => alert(`View report ${report.id} details`)}
                            >
                              View Details
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't submitted any pet reports yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/report')}
                  >
                    Report a Pet
                  </Button>
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab Panel component for displaying tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default UserProfilePage;