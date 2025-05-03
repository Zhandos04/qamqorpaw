import React, { useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Box, 
  Button, 
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ReportIcon from '@mui/icons-material/Report';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import Footer from './Footer';
import { AuthContext } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };
  
  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button onClick={() => navigate('/')}>
          <ListItemIcon><PetsIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => navigate('/dogs')}>
          <ListItemIcon><PetsIcon /></ListItemIcon>
          <ListItemText primary="Dogs" />
        </ListItem>
        <ListItem button onClick={() => navigate('/cats')}>
          <ListItemIcon><PetsIcon /></ListItemIcon>
          <ListItemText primary="Cats" />
        </ListItem>
        <ListItem button onClick={() => navigate('/shelters')}>
          <ListItemIcon><LocationOnIcon /></ListItemIcon>
          <ListItemText primary="Shelters & Clinics" />
        </ListItem>
        <ListItem button onClick={() => navigate('/report')}>
          <ListItemIcon><ReportIcon /></ListItemIcon>
          <ListItemText primary="Report a Pet" />
        </ListItem>
        <ListItem button onClick={() => navigate('/donate')}>
          <ListItemIcon><FavoriteIcon /></ListItemIcon>
          <ListItemText primary="Donate" />
        </ListItem>
      </List>
      <Divider />
      {isAuthenticated ? (
        <List>
          <ListItem button onClick={() => navigate('/profile')}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button onClick={() => navigate('/favorites')}>
            <ListItemIcon><FavoriteIcon /></ListItemIcon>
            <ListItemText primary="Favorites" />
          </ListItem>
          <ListItem button onClick={() => navigate('/my-reports')}>
            <ListItemIcon><ReportIcon /></ListItemIcon>
            <ListItemText primary="My Reports" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button onClick={() => navigate('/login')}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button onClick={() => navigate('/register')}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Sign Up" />
          </ListItem>
        </List>
      )}
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#f2e6d7' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, color: '#333' }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: '#333', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            QamqorPaw
          </Typography>
          
          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" sx={{ color: '#333' }} onClick={() => navigate('/dogs')}>Dogs</Button>
            <Button color="inherit" sx={{ color: '#333' }} onClick={() => navigate('/cats')}>Cats</Button>
            <Button color="inherit" sx={{ color: '#333' }} onClick={() => navigate('/shelters')}>Shelters & Clinics</Button>
            <Button color="inherit" sx={{ color: '#333' }} onClick={() => navigate('/report')}>Report a Pet</Button>
            <Button color="inherit" sx={{ color: '#333' }} onClick={() => navigate('/donate')}>Donate</Button>
            
            {isAuthenticated ? (
              <>
                <IconButton onClick={handleUserMenuOpen} color="inherit" sx={{ color: '#333' }}>
                  <Avatar 
                    src={currentUser?.profile?.photo} 
                    alt={currentUser?.username} 
                    sx={{ width: 32, height: 32 }}
                  >
                    {currentUser?.username?.[0]?.toUpperCase() || <PersonIcon />}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/favorites'); }}>Favorites</MenuItem>
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/my-reports'); }}>My Reports</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" sx={{ color: '#333' }} onClick={() => navigate('/login')}>Login</Button>
                <Button 
                  variant="contained" 
                  sx={{ backgroundColor: '#75c6d1', color: 'white' }}
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerList()}
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default MainLayout;