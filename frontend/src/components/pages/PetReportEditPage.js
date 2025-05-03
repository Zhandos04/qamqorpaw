import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { petsApi, sheltersApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { AuthContext } from '../../contexts/AuthContext';
import { getImageUrl } from '../../config';

const PetReportEditPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [cities, setCities] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Image previews
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
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
    description: '',
    price: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/reports/${id}/edit` } });
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch report data
        const reportResponse = await petsApi.getReportById(id);
        const reportData = reportResponse.data;
        setReport(reportData);
        
        // Initialize form with report data
        setFormData({
          pet_type: reportData.pet_type || 'dog',
          name: reportData.name || '',
          breed: reportData.breed || '',
          is_stray: reportData.is_stray,
          age: reportData.age || '',
          color: reportData.color || '',
          gender: reportData.gender || '',
          size: reportData.size || '',
          behavior: reportData.behavior || '',
          city: reportData.city || '',
          street: reportData.street || '',
          vaccinated: reportData.vaccinated,
          sterilized: reportData.sterilized,
          description: reportData.description || '',
          price: reportData.price || ''
        });
        
        // Set existing images
        if (reportData.photos && reportData.photos.length > 0) {
          setExistingImages(reportData.photos);
        }
        
        // Fetch breeds and cities for dropdown selections
        const [breedResponse, cityResponse] = await Promise.all([
          petsApi.getAllBreeds({ pet_type: reportData.pet_type }),
          sheltersApi.getAllCities()
        ]);
        
        setBreeds(breedResponse.data.results || []);
        setCities(cityResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isAuthenticated, navigate]);
  
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
      
      // Limit to maximum 5 images total (existing + new)
      if (existingImages.length + selectedImages.length + files.length > 5) {
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
  
  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
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
    
    if (existingImages.length === 0 && selectedImages.length === 0) {
      newErrors.photos = 'At least one photo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmitConfirmation = () => {
    if (!validate()) {
      return;
    }
    setConfirmDialogOpen(true);
  };
  
  const handleSubmit = async () => {
    setConfirmDialogOpen(false);
    setSubmitLoading(true);
    setError('');
    
    try {
      // Create update data
      const updateData = {
        ...formData,
        photos: selectedImages
      };
      
      // Include existing photo IDs to keep
      if (existingImages.length > 0) {
        updateData.existing_photos = existingImages.map(photo => photo.id);
      }
      
      await petsApi.updateReport(id, updateData);
      
      // Redirect to the report view page
      navigate(`/reports/${id}`);
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report. Please try again.');
      setSubmitLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/reports/${id}`);
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading report data..." />;
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Report Edit
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" noValidate>
          <Typography variant="h6" gutterBottom>
            Main Information
          </Typography>
          
          <Grid container spacing={3}>
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_stray}
                      onChange={handleSwitchChange}
                      name="is_stray"
                    />
                  }
                  label="Stray *"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age *"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                helperText="Age in months"
                InputProps={{ inputProps: { min: 0 } }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="color-label">Color *</InputLabel>
                <Select
                  labelId="color-label"
                  name="color"
                  value={formData.color}
                  label="Color *"
                  onChange={handleChange}
                  error={!!errors.color}
                >
                  <MenuItem value="">Select...</MenuItem>
                  <MenuItem value="Black">Black</MenuItem>
                  <MenuItem value="White">White</MenuItem>
                  <MenuItem value="Brown">Brown</MenuItem>
                  <MenuItem value="Gray">Gray</MenuItem>
                  <MenuItem value="Tan">Tan</MenuItem>
                  <MenuItem value="Mixed">Mixed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" required>
                <FormLabel component="legend">Gender *</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" required>
                <FormLabel component="legend">Size *</FormLabel>
                <RadioGroup
                  row
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                >
                  <FormControlLabel value="small" control={<Radio />} label="Small" />
                  <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                  <FormControlLabel value="large" control={<Radio />} label="Big" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" required>
                <FormLabel component="legend">Availability *</FormLabel>
                <RadioGroup
                  row
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <FormControlLabel value="for_adoption" control={<Radio />} label="For Adoption" />
                  <FormControlLabel value="foster_needed" control={<Radio />} label="Foster Needed" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" required>
                <FormLabel component="legend">Behavior **</FormLabel>
                <RadioGroup
                  row
                  name="behavior"
                  value={formData.behavior}
                  onChange={handleChange}
                >
                  <FormControlLabel value="friendly" control={<Radio />} label="Friendly" />
                  <FormControlLabel value="active" control={<Radio />} label="Active" />
                  <FormControlLabel value="calm" control={<Radio />} label="Calm" />
                  <FormControlLabel value="playful" control={<Radio />} label="Playful" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Breed
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="breed-label">Breed *</InputLabel>
                <Select
                  labelId="breed-label"
                  name="breed"
                  value={formData.breed}
                  label="Breed *"
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
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.city}>
                <InputLabel id="city-label">City *</InputLabel>
                <Select
                  labelId="city-label"
                  name="city"
                  value={formData.city}
                  label="City *"
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
                label="Street *"
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
                Photos
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current photos:
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {existingImages.length > 0 ? (
                    existingImages.map((photo, index) => (
                      <Grid item xs={6} sm={4} md={3} key={photo.id}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="140"
                            image={getImageUrl(photo.image)}
                            alt={`Photo ${index + 1}`}
                          />
                          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton onClick={() => handleRemoveExistingImage(index)} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        No photos currently associated with this report.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mb: 2 }}
              >
                Upload New Photos
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
              
              {imagePreviews.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    New photos to add:
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
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
                </Box>
              )}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCancel}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitConfirmation}
              disabled={submitLoading}
            >
              {submitLoading ? 'Updating...' : 'Update Report'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          Confirm your action
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to submit?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>No</Button>
          <Button onClick={handleSubmit} color="primary">Yes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PetReportEditPage;