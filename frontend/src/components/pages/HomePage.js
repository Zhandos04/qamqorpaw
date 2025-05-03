import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, Container, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { petsApi, sheltersApi } from '../../services/api';
import { getImageUrl } from '../../config';
import LoadingSpinner from '../common/LoadingSpinner';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dogs, setDogs] = useState([]);
  const [cats, setCats] = useState([]);
  const [stats, setStats] = useState({
    totalPets: 0,
    totalDogs: 0,
    totalCats: 0,
    totalShelters: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const [petsStatsRes, sheltersStatsRes] = await Promise.all([
          petsApi.getPetStats(),
          sheltersApi.getShelterStats()
        ]);
        
        setStats({
          totalPets: petsStatsRes.data.total,
          totalDogs: petsStatsRes.data.dogs,
          totalCats: petsStatsRes.data.cats,
          totalShelters: sheltersStatsRes.data.total
        });

        // Fetch featured pets
        const [dogsRes, catsRes] = await Promise.all([
          petsApi.getAllPets({ pet_type: 'dog', limit: 4 }),
          petsApi.getAllPets({ pet_type: 'cat', limit: 4 })
        ]);
        
        setDogs(dogsRes.data.results || []);
        setCats(catsRes.data.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          height: 400,
          backgroundImage: 'url(/images/hero-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container>
          <Box sx={{ maxWidth: 600, p: 3, bgcolor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Find a Loving Home for Every Pet
            </Typography>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Connect loving foster homes with pets in need. QamqorPaw makes fostering easy, safe, and rewarding.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ mr: 2 }}
              onClick={() => navigate('/dogs')}
            >
              Start Fostering
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Dog Adoption Section */}
      <Typography variant="h4" component="h2" gutterBottom>
        Dog Adoption
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {dogs.map(dog => (
          <Grid item xs={12} sm={6} md={3} key={dog.id}>
            <Card>
              <CardActionArea onClick={() => navigate(`/pets/${dog.id}`)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(dog.photos[0]?.image) || '/images/dog-placeholder.jpg'}
                  alt={dog.name}
                  className="pet-card-image"
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {dog.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dog.breed_name || 'Mixed Breed'}, {dog.age} months
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dog.city_name || 'Unknown Location'}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {dog.price ? `${dog.price} ₸` : 'Free'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <Button variant="outlined" onClick={() => navigate('/dogs')}>
          Show More
        </Button>
      </Box>
      
      {/* Cat Adoption Section */}
      <Typography variant="h4" component="h2" gutterBottom>
        Cat Adoption
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {cats.map(cat => (
          <Grid item xs={12} sm={6} md={3} key={cat.id}>
            <Card>
              <CardActionArea onClick={() => navigate(`/pets/${cat.id}`)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(cat.photos[0]?.image) || '/images/cat-placeholder.jpg'}
                  alt={cat.name}
                  className="pet-card-image"
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {cat.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.breed_name || 'Mixed Breed'}, {cat.age} months
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.city_name || 'Unknown Location'}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {cat.price ? `${cat.price} ₸` : 'Free'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <Button variant="outlined" onClick={() => navigate('/cats')}>
          Show More
        </Button>
      </Box>
      
      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={() => navigate('/report')}>
              <CardMedia
                component="img"
                height="180"
                image="/images/start-fostering.jpg"
                alt="Start Fostering"
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  Start Fostering!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Become a foster hero by providing a temporary loving home for an animal in need.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={() => navigate('/cats')}>
              <CardMedia
                component="img"
                height="180"
                image="/images/how-it-works.jpg"
                alt="How It Works"
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  How It Works
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign up, match with a pet, book a meet-and-greet, and you're on your way to fostering!
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={() => navigate('/shelters')}>
              <CardMedia
                component="img"
                height="180"
                image="/images/find-pet.jpg"
                alt="Find a Pet"
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  Find a Pet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse local pets looking for loving homes and find the one that matches your lifestyle.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
      
      {/* Map Section */}
      <Typography variant="h4" component="h2" gutterBottom>
        Find Easily Shelters & Veterinary Clinics
      </Typography>
      <Card sx={{ mb: 6 }}>
        <CardActionArea onClick={() => navigate('/shelters/map')}>
          <CardMedia
            component="img"
            height="400"
            image="/images/shelters-map.jpg"
            alt="Shelters Map"
          />
        </CardActionArea>
      </Card>
      
      {/* Platform Stats */}
      <Box sx={{ bgcolor: '#f5f5f5', p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h3" align="center" gutterBottom>
          Platform Statistics
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" align="center" color="primary">
              {stats.totalPets}
            </Typography>
            <Typography variant="body1" align="center">
              Total Pets
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" align="center" color="primary">
              {stats.totalDogs}
            </Typography>
            <Typography variant="body1" align="center">
              Dogs
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" align="center" color="primary">
              {stats.totalCats}
            </Typography>
            <Typography variant="body1" align="center">
              Cats
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h4" align="center" color="primary">
              {stats.totalShelters}
            </Typography>
            <Typography variant="body1" align="center">
              Shelters & Clinics
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;