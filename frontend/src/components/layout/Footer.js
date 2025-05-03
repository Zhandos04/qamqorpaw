import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#f2e6d7', pt: 6, pb: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              QamqorPaw
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Platform for pet fostering and adoption
            </Typography>
            <Box sx={{ display: 'flex', mt: 2 }}>
              <IconButton aria-label="facebook" size="small" sx={{ mr: 1 }}>
                <FacebookIcon />
              </IconButton>
              <IconButton aria-label="twitter" size="small" sx={{ mr: 1 }}>
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="instagram" size="small" sx={{ mr: 1 }}>
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="linkedin" size="small">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Navigate
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/dogs" color="inherit" display="block" sx={{ mb: 1 }}>
              Dog Adoption
            </Link>
            <Link component={RouterLink} to="/cats" color="inherit" display="block" sx={{ mb: 1 }}>
              Cat Adoption
            </Link>
            <Link component={RouterLink} to="/shelters" color="inherit" display="block" sx={{ mb: 1 }}>
              Shelters & Clinics
            </Link>
            <Link component={RouterLink} to="/report" color="inherit" display="block" sx={{ mb: 1 }}>
              Report a Found Pet
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              For Clinics & Shelter Owners
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Phone: +7-(777)-777-7777
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Email: info@qamqorpaw.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Telegram: @qamqorpet
            </Typography>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ mt: 2 }}>
              Catch Up
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              QamqorApp
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Instagram
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Telegram
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 3, mb: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} QamqorPaw. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;