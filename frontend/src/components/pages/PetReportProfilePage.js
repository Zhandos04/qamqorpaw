import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { petsApi } from '../../services/api';
import { getImageUrl } from '../../config';
import LoadingSpinner from '../common/LoadingSpinner';
import { AuthContext } from '../../contexts/AuthContext';

const PetReportProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await petsApi.getReportById(id);
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('Failed to load report. It may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);
  
  const handleEditClick = () => {
    navigate(`/reports/${id}/edit`);
  };
  
  const handleMessageClick = () => {
    // This would typically open a messaging interface
    alert('Messaging functionality would be implemented here');
  };
  
  const canEdit = () => {
    if (!isAuthenticated || !report || !currentUser) return false;
    return currentUser.id === report.reporter || currentUser.is_staff;
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error || !report) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Report not found'}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-reports')}
          sx={{ mt: 2 }}
        >
          Back to My Reports
        </Button>
      </Box>
    );
  }
  
  const mainImage = report.photos && report.photos.length > 0 
    ? getImageUrl(report.photos[selectedImage]?.image) 
    : report.pet_type === 'dog' 
      ? '/images/dog-placeholder.jpg' 
      : '/images/cat-placeholder.jpg';
  
  return (
    <Box>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/my-reports')}
        sx={{ mb: 3 }}
      >
        Back to My Reports
      </Button>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Left column - Main Image and thumbnails */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={mainImage}
              alt={report.name || "Unnamed pet"}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 2
              }}
              className="pet-profile-image"
            />
            
            {/* Thumbnails */}
            {report.photos && report.photos.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {report.photos.map((photo, index) => (
                  <Box
                    key={photo.id}
                    component="img"
                    src={getImageUrl(photo.image)}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={`pet-thumbnail ${selectedImage === index ? 'active' : ''}`}
                    sx={{
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 0,
                      borderColor: 'primary.main',
                      borderRadius: 1
                    }}
                  />
                ))}
              </Box>
            )}
          </Grid>
          
          {/* Right column - Pet details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {report.name || "Unnamed (Stray)"}
              </Typography>
              
              {canEdit() && (
                <IconButton 
                  color="primary" 
                  onClick={handleEditClick}
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>
            
            <Typography variant="h6" color="primary" gutterBottom>
              {report.price ? `${report.price} ₸` : 'Free'}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={
                  report.status === 'pending' ? 'Pending' : 
                  report.status === 'approved' ? 'Approved' : 
                  report.status === 'rejected' ? 'Rejected' : 'Resolved'
                }
                color={
                  report.status === 'pending' ? 'warning' : 
                  report.status === 'approved' ? 'success' : 
                  report.status === 'rejected' ? 'error' : 'info'
                }
                sx={{ mr: 1 }}
              />
              
              <Chip 
                label={report.availability}
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleMessageClick}
              sx={{ mb: 3 }}
            >
              Message
            </Button>
            
            <Typography variant="h6" gutterBottom>
              Main Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.city_name}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Availability
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.availability === 'for_adoption' ? 'Available for adoption' : 'Foster needed'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Breed
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.breed_name || 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Age
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.age ? `${report.age} months` : 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.gender === 'male' ? 'Male' : 'Female'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Size
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.size === 'small' ? 'Small' : 
                  report.size === 'medium' ? 'Medium' : 'Large'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Color
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.color}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Behavior
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.behavior === 'friendly' ? 'Friendly, Playful' : 
                  report.behavior === 'active' ? 'Active' : 
                  report.behavior === 'calm' ? 'Calm' : 
                  report.behavior === 'playful' ? 'Playful' : 'Unknown'}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Health Details
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Vaccinated
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.vaccinated === true ? 'Yes' : 
                  report.vaccinated === false ? 'No' : 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Sterilized
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.sterilized === true ? 'Yes' : 
                  report.sterilized === false ? 'No' : 'Unknown'}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Adoption Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Contact
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {report.reporter_name || 'Anonymous'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" gutterBottom>
                  +7-(701)-765-5544
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        
        <Typography variant="body1" paragraph>
          {report.description || 'No description provided.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default PetReportProfilePage;