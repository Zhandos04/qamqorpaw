import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardActionArea, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  IconButton 
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { getImageUrl } from '../../config';
import { petsApi } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

const PetCard = ({ pet, isFavorite, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await petsApi.toggleFavorite(pet.id);
      if (onFavoriteToggle) {
        onFavoriteToggle(pet.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  const getDefaultImage = () => {
    return pet.pet_type === 'dog' 
      ? '/images/dog-placeholder.jpg' 
      : '/images/cat-placeholder.jpg';
  };
  
  const mainImage = pet.photos && pet.photos.length > 0 
    ? getImageUrl(pet.photos[0]?.image) 
    : getDefaultImage();
  
  return (
    <Card sx={{ position: 'relative' }}>
      <CardActionArea onClick={() => navigate(`/pets/${pet.id}`)}>
        <CardMedia
          component="img"
          height="200"
          image={mainImage}
          alt={pet.name}
          className="pet-card-image"
        />
        {isAuthenticated && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
            onClick={handleFavoriteClick}
          >
            {pet.is_favorite || isFavorite ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        )}
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {pet.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pet.breed_name || 'Mixed Breed'}{pet.age ? `, ${pet.age} months` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pet.city_name || 'Unknown Location'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="h6" color="primary">
              {pet.price ? `${pet.price} ₸` : 'Free'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: 'rgba(117, 198, 209, 0.1)', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                color: 'primary.main'
              }}
            >
              {pet.availability === 'for_adoption' ? 'For Adoption' : 
               pet.availability === 'foster_needed' ? 'Foster Needed' :
               pet.availability === 'private_owner' ? 'Private Owner' : 'Shelter'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PetCard;