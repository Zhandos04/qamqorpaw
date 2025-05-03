import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Divider,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { usersApi } from '../../services/api';
import PetCard from '../common/PetCard';
import LoadingSpinner from '../common/LoadingSpinner';

const UserFavoritesPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/favorites' } });
      return;
    }
    
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await usersApi.getFavorites();
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated, navigate]);
  
  const handleFavoriteToggle = (petId) => {
    setFavorites(favorites.filter(pet => pet.id !== petId));
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading favorites..." />;
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Favorite Pets
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {favorites.length > 0 ? (
        <Grid container spacing={3}>
          {favorites.map(pet => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={pet.id}>
              <PetCard 
                pet={pet} 
                isFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You haven't added any pets to your favorites yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Browse our pets and click the heart icon to add them to your favorites
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/dogs')}
            >
              Browse Dogs
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/cats')}
            >
              Browse Cats
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default UserFavoritesPage;