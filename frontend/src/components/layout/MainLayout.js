import React, { useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Box, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  InputBase
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ReportIcon from '@mui/icons-material/Report';
import SearchIcon from '@mui/icons-material/Search';
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
      <AppBar position="static" sx={{ backgroundColor: '#E5D7C3', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, color: '#333', display: { md: 'none' } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/images/logo.png" alt="QamqorPaw" height="45" />
          </Box>
          
          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4, flexGrow: 1 }}>
            <Button 
              color="inherit" 
              sx={{ 
                color: '#333', 
                mx: 1, 
                fontSize: '16px', 
                textTransform: 'none',
                fontWeight: 'normal'
              }} 
              onClick={() => navigate('/report')}
            >
              Pet Report
            </Button>
            <Button 
              color="inherit" 
              sx={{ 
                color: '#333', 
                mx: 1, 
                fontSize: '16px', 
                textTransform: 'none',
                fontWeight: 'normal'
              }} 
              onClick={() => navigate('/dogs')}
            >
              Adopt
            </Button>
            <Button 
              color="inherit" 
              sx={{ 
                color: '#333', 
                mx: 1, 
                fontSize: '16px', 
                textTransform: 'none',
                fontWeight: 'normal'
              }} 
              onClick={() => navigate('/shelters')}
            >
              Shelters & Clinics
            </Button>
          </Box>
          
          {/* Search Box - обновленный дизайн */}
        <Box 
        sx={{ 
            position: 'relative',
            borderRadius: '20px',
            backgroundColor: '#F5F5F5',
            mx: 1,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '100%', sm: 220 },
            marginLeft: { sm: 'auto' },
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #E0E0E0',
            height: '36px',
        }}
        >
        <InputBase
            placeholder="Search"
            sx={{ 
            color: '#666',
            width: '100%',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '21px',
            '& .MuiInputBase-input': {
                padding: '8px 8px 8px 16px',
            }
            }}
        />
        <IconButton 
            type="button" 
            sx={{ 
            p: '5px', 
            color: '#666',
            bgcolor: 'transparent' 
            }}
        >
            <SearchIcon fontSize="small" />
        </IconButton>
        </Box>
          
          {/* Кнопки аутентификации - обновленный дизайн */}
{isAuthenticated ? (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
  </Box>
) : (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Button 
      color="inherit" 
      sx={{ 
        color: '#333', 
        mx: 1, 
        textTransform: 'none',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '21px',
        letterSpacing: '0%',
      }} 
      onClick={() => navigate('/login')}
    >
      Login
    </Button>
    <Button 
      variant="contained" 
      sx={{ 
        backgroundColor: '#75c6d1',
        color: 'white',
        textTransform: 'none',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '21px',
        letterSpacing: '0%',
        borderRadius: '28px',
        px: 3,
        py: 0.8,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }}
      onClick={() => navigate('/register')}
    >
      Sign Up
    </Button>
  </Box>
)}
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