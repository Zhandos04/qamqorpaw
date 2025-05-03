import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import PetsIcon from '@mui/icons-material/Pets';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MessageIcon from '@mui/icons-material/Message';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { petsApi } from '../../services/api';
import { getImageUrl } from '../../config';
import LoadingSpinner from '../common/LoadingSpinner';
import { AuthContext } from '../../contexts/AuthContext';

const PetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await petsApi.getPetById(id);
        setPet(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pet details:', error);
        setError('Failed to load pet details. The pet may not exist or has been removed.');
        setLoading(false);
      }
    };
    
    fetchPet();
  }, [id]);
  
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await petsApi.toggleFavorite(pet.id);
      setPet(prev => ({
        ...prev,
        is_favorite: !prev.is_favorite
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // In a real app, this could open a messaging modal or navigate to a chat page
    alert('Contact feature would be implemented here. For now, please use the contact information shown on the page.');
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  // Default image handling
  const getDefaultImage = () => {
    return pet.pet_type === 'dog' 
      ? '/images/dog-placeholder.jpg' 
      : '/images/cat-placeholder.jpg';
  };
  
  const mainImage = pet.photos && pet.photos.length > 0 
    ? getImageUrl(pet.photos[selectedImage]?.image) 
    : getDefaultImage();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        
        {isAuthenticated && (
          <IconButton
            color={pet.is_favorite ? 'error' : 'default'}
            onClick={handleToggleFavorite}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            {pet.is_favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        )}
      </Box>
      
      <Grid container spacing={4}>
        {/* Left column - Images */}
        <Grid item xs={12} md={7}>
          <Box
            component="img"
            src={mainImage}
            alt={pet.name}
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
          {pet.photos && pet.photos.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {pet.photos.map((photo, index) => (
                <Box
                  key={photo.id}
                  component="img"
                  src={getImageUrl(photo.image)}
                  alt={`${pet.name} thumbnail ${index + 1}`}
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
        
        {/* Right column - Details */}
        <Grid item xs={12} md={5}>
          <Typography variant="h4" component="h1" gutterBottom>
            {pet.name}
            {pet.is_stray && (
              <Chip 
                label="Stray" 
                color="secondary" 
                size="small" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <Typography variant="h6" color="primary" gutterBottom>
            {pet.price > 0 ? `${pet.price} ₸` : 'Free'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1">
              {pet.city_name || 'Unknown location'}
            </Typography>
          </Box>
          
          <Chip 
            label={
              pet.availability === 'for_adoption' ? 'For Adoption' : 
              pet.availability === 'foster_needed' ? 'Foster Needed' :
              pet.availability === 'private_owner' ? 'Private Owner' : 'Shelter'
            }
            color="primary"
            sx={{ mb: 3 }}
          />
          
          <Button
            variant="contained"
            fullWidth
            startIcon={<MessageIcon />}
            onClick={handleContact}
            sx={{ mb: 2 }}
          >
            Contact
          </Button>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Pet info table */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} /> Main Information
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Breed</strong></TableCell>
                  <TableCell>{pet.breed_name || 'Unknown'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Age</strong></TableCell>
                  <TableCell>{pet.age ? `${pet.age} months` : 'Unknown'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Gender</strong></TableCell>
                  <TableCell>{pet.gender === 'male' ? 'Male' : 'Female'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Size</strong></TableCell>
                  <TableCell>
                    {pet.size === 'small' ? 'Small' : 
                     pet.size === 'medium' ? 'Medium' : 'Large'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Color</strong></TableCell>
                  <TableCell>{pet.color || 'Not specified'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Behavior</strong></TableCell>
                  <TableCell>
                    {pet.behavior === 'friendly' ? 'Friendly' :
                     pet.behavior === 'active' ? 'Active' :
                     pet.behavior === 'calm' ? 'Calm' : 'Playful'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Health details */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalServicesIcon sx={{ mr: 1 }} /> Health Details
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Vaccinated</strong></TableCell>
                  <TableCell>{pet.vaccinated ? 'Yes' : 'No'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Sterilized</strong></TableCell>
                  <TableCell>{pet.sterilized ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Shelter info if available */}
          {pet.shelter && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PetsIcon sx={{ mr: 1 }} /> Shelter Information
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">{pet.shelter_name}</Typography>
                  <Button 
                    component={Link} 
                    to={`/shelters/${pet.shelter}`}
                    variant="outlined" 
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    View Shelter
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Description */}
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {pet.description || 'No description provided.'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PetDetailsPage;