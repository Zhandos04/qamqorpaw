import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Switch,
  Alert,
  Card,
  CardMedia,
  IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { petsApi, sheltersApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { AuthContext } from '../../contexts/AuthContext';

const PetReportPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [breeds, setBreeds] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Image previews
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    pet_type: 'dog',
    name: '',
    breed: '',
    is_stray: true,
    age: '',
    color: '',
    gender: '',
    size: '',
    behavior: '',
    city: '',
    street: '',
    vaccinated: null,
    sterilized: null,
    description: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/report' } });
      return;
    }
    
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [breedResponse, cityResponse] = await Promise.all([
          petsApi.getAllBreeds({ pet_type: formData.pet_type }),
          sheltersApi.getAllCities()
        ]);
        
        setBreeds(breedResponse.data.results || []);
        setCities(cityResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [formData.pet_type, isAuthenticated, navigate]);
  
  // Handle breed change when pet type changes
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await petsApi.getAllBreeds({ pet_type: formData.pet_type });
        setBreeds(response.data.results || []);
        // Reset breed when pet type changes
        setFormData(prev => ({ ...prev, breed: '' }));
      } catch (error) {
        console.error('Error fetching breeds:', error);
      }
    };
    
    fetchBreeds();
  }, [formData.pet_type]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleBooleanChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Limit to maximum 5 images
      if (selectedImages.length + files.length > 5) {
        setError('Maximum 5 images are allowed');
        return;
      }
      
      setSelectedImages(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Clear validation error for photos if it exists
      if (errors.photos) {
        setErrors(prev => ({ ...prev, photos: '' }));
      }
    }
  };
  
  const handleRemoveImage = (index) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.pet_type) {
      newErrors.pet_type = 'Pet type is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street or location details are required';
    }
    
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    
    if (selectedImages.length === 0) {
      newErrors.photos = 'At least one photo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSubmitLoading(true);
    setError('');
    
    try {
      // Create report data
      const reportData = {
        ...formData,
        photos: selectedImages
      };
      
      await petsApi.reportPet(reportData);
      
      // Redirect to confirmation page
      navigate('/report/confirmation');
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading form..." />;
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Report a Found Pet
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        Fill out the form below to report a found pet. This information will help the pet's owner locate them.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" gutterBottom>
            Who do you Want to Report?
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.pet_type}>
                <FormLabel id="pet-type-label">Pet Type*</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="pet-type-label"
                  name="pet_type"
                  value={formData.pet_type}
                  onChange={handleChange}
                >
                  <FormControlLabel value="dog" control={<Radio />} label="Dog" />
                  <FormControlLabel value="cat" control={<Radio />} label="Cat" />
                </RadioGroup>
                {errors.pet_type && (
                  <Typography variant="caption" color="error">
                    {errors.pet_type}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_stray}
                    onChange={handleSwitchChange}
                    name="is_stray"
                  />
                }
                label="Stray"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                helperText="If known or has a collar tag"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="breed-label">Breed</InputLabel>
                <Select
                  labelId="breed-label"
                  name="breed"
                  value={formData.breed}
                  label="Breed"
                  onChange={handleChange}
                >
                  <MenuItem value="">Unknown</MenuItem>
                  {breeds.map(breed => (
                    <MenuItem key={breed.id} value={breed.id}>
                      {breed.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                helperText="Age in months (approximate)"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                error={!!errors.color}
                helperText={errors.color || "Pet's primary color"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="">Unknown</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="size-label">Size</InputLabel>
                <Select
                  labelId="size-label"
                  name="size"
                  value={formData.size}
                  label="Size"
                  onChange={handleChange}
                >
                  <MenuItem value="">Unknown</MenuItem>
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="behavior-label">Behavior</InputLabel>
                <Select
                  labelId="behavior-label"
                  name="behavior"
                  value={formData.behavior}
                  label="Behavior"
                  onChange={handleChange}
                >
                  <MenuItem value="">Unknown</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="calm">Calm</MenuItem>
                  <MenuItem value="playful">Playful</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.city}>
                <InputLabel id="city-label">City*</InputLabel>
                <Select
                  labelId="city-label"
                  name="city"
                  value={formData.city}
                  label="City*"
                  onChange={handleChange}
                >
                  {cities.map(city => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.city && (
                  <Typography variant="caption" color="error">
                    {errors.city}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Street/Area"
                name="street"
                value={formData.street}
                onChange={handleChange}
                error={!!errors.street}
                helperText={errors.street || "Where was the pet found?"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Health Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Vaccinated</FormLabel>
                <RadioGroup
                  row
                  name="vaccinated-group"
                  value={formData.vaccinated === null ? '' : formData.vaccinated.toString()}
                  onChange={(e) => handleBooleanChange('vaccinated', e.target.value === 'true')}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                  <FormControlLabel value="" control={<Radio />} label="Unknown" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Sterilized</FormLabel>
                <RadioGroup
                  row
                  name="sterilized-group"
                  value={formData.sterilized === null ? '' : formData.sterilized.toString()}
                  onChange={(e) => handleBooleanChange('sterilized', e.target.value === 'true')}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                  <FormControlLabel value="" control={<Radio />} label="Unknown" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Description
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide any additional details about the pet..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Photos*
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mb: 2 }}
              >
                Upload Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              
              {errors.photos && (
                <Typography variant="caption" color="error" display="block" sx={{ mb: 2 }}>
                  {errors.photos}
                </Typography>
              )}
              
              <Grid container spacing={2}>
                {imagePreviews.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={preview}
                        alt={`Preview ${index + 1}`}
                      />
                      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => handleRemoveImage(index)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitLoading}
              sx={{ minWidth: 200 }}
            >
              {submitLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PetReportPage;