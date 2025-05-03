import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PetReportConfirmationPage = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', mt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 4
        }}>
          <CheckCircleOutlineIcon 
            color="success" 
            sx={{ fontSize: 80, mb: 2 }} 
          />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Success!
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Your pet report has been submitted
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for helping reunite a lost pet with their family. Your report has been received and will be reviewed by our team.
          </Typography>
          
          <Card sx={{ mb: 3, maxWidth: 320, width: '100%' }}>
            <CardMedia
              component="img"
              height="180"
              image="/images/thank-you.jpg"
              alt="Thank you"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Your compassion makes a difference in the lives of pets and their owners. We'll process your report as quickly as possible.
              </Typography>
            </CardContent>
          </Card>
          
          <Typography variant="body1" gutterBottom>
            What happens next?
          </Typography>
          
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="body2" paragraph>
              • Your report will be reviewed by our team
            </Typography>
            <Typography variant="body2" paragraph>
              • It will be published on our platform for pet owners to search
            </Typography>
            <Typography variant="body2" paragraph>
              • We'll notify you if someone claims the pet
            </Typography>
            <Typography variant="body2" paragraph>
              • You can check the status of your report in "My Reports" section
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/my-reports')}
            >
              View My Reports
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PetReportConfirmationPage;