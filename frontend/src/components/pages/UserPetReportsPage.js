import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../../contexts/AuthContext';
import { petsApi } from '../../services/api';
import { getImageUrl } from '../../config';
import LoadingSpinner from '../common/LoadingSpinner';

const UserPetReportsPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-reports' } });
      return;
    }
    
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await petsApi.getUserReports();
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [isAuthenticated, navigate]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleDeleteClick = (report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      // In a real implementation, this would call an API to delete the report
      await petsApi.updateReportStatus(selectedReport.id, 'deleted');
      
      // Update local state
      setReports(reports.filter(report => report.id !== selectedReport.id));
      setDeleteDialogOpen(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedReport(null);
  };
  
  const handleEditClick = (reportId) => {
    navigate(`/reports/${reportId}/edit`);
  };
  
  const handleViewDetailsClick = (reportId) => {
    navigate(`/reports/${reportId}`);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.light;
      case 'approved':
        return theme.palette.success.light;
      case 'rejected':
        return theme.palette.error.light;
      case 'resolved':
        return theme.palette.info.light;
      default:
        return theme.palette.grey[400];
    }
  };
  
  const filteredReports = tabValue === 0 
    ? reports 
    : reports.filter(report => report.status === 
      tabValue === 1 ? 'pending' : 
      tabValue === 2 ? 'approved' : 
      tabValue === 3 ? 'rejected' : 'resolved'
    );
  
  if (loading) {
    return <LoadingSpinner message="Loading reports..." />;
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Pet Reports
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          These are the pets you have reported as found
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => navigate('/report')}
        >
          Report New Pet
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          aria-label="report status tabs"
        >
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
          <Tab label="Resolved" />
        </Tabs>
      </Paper>
      
      {reports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You haven't submitted any pet reports yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Help lost pets find their way home by reporting pets you've found
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/report')}
            sx={{ mt: 2 }}
          >
            Report a Found Pet
          </Button>
        </Paper>
      ) : filteredReports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No reports match the selected filter
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => setTabValue(0)}
            sx={{ mt: 2 }}
          >
            View All Reports
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredReports.map(report => (
            <Grid item xs={12} key={report.id}>
              <Card>
                <Grid container>
                  {/* Left side - Image */}
                  <Grid item xs={12} sm={4} md={3}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        report.photos && report.photos.length > 0
                          ? getImageUrl(report.photos[0].image)
                          : report.pet_type === 'dog'
                          ? '/images/dog-placeholder.jpg'
                          : '/images/cat-placeholder.jpg'
                      }
                      alt={report.name || 'Reported pet'}
                    />
                  </Grid>
                  
                  {/* Right side - Content */}
                  <Grid item xs={12} sm={8} md={9}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {report.name || `Unnamed ${report.pet_type === 'dog' ? 'Dog' : 'Cat'}`}
                          {report.is_stray && (
                            <Chip 
                              label="Stray" 
                              size="small" 
                              sx={{ ml: 1, bgcolor: theme.palette.secondary.light }} 
                            />
                          )}
                        </Typography>
                        
                        <Chip 
                          label={report.status.charAt(0).toUpperCase() + report.status.slice(1)} 
                          size="small"
                          sx={{ bgcolor: getStatusColor(report.status) }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {report.breed_name || 'Unknown breed'}, {report.color}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Reported on:</strong> {new Date(report.created_at).toLocaleDateString()}
                          </Typography>
                          
                          <Typography variant="body2" gutterBottom>
                            <strong>Location:</strong> {report.city_name}, {report.street}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Gender:</strong> {report.gender ? (report.gender === 'male' ? 'Male' : 'Female') : 'Unknown'}
                          </Typography>
                          
                          <Typography variant="body2" gutterBottom>
                            <strong>Age:</strong> {report.age ? `${report.age} months` : 'Unknown'}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {report.description 
                          ? (report.description.length > 150 
                              ? `${report.description.substring(0, 150)}...` 
                              : report.description)
                          : 'No description provided.'}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(report)}
                          disabled={report.status === 'resolved'}
                        >
                          <DeleteIcon />
                        </IconButton>
                        
                        <IconButton 
                          color="primary"
                          disabled={report.status === 'resolved'}
                          onClick={() => handleEditClick(report.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleViewDetailsClick(report.id)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
          Delete Report
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserPetReportsPage;