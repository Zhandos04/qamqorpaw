import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context providers
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Import only the necessary components for initial load
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load other components to improve performance
const HomePage = lazy(() => import('./components/pages/HomePage'));
const DogAdoptionPage = lazy(() => import('./components/pages/DogAdoptionPage'));
const CatAdoptionPage = lazy(() => import('./components/pages/CatAdoptionPage'));
const PetDetailsPage = lazy(() => import('./components/pages/PetDetailsPage'));
const SheltersMapPage = lazy(() => import('./components/pages/SheltersMapPage'));
const SheltersListPage = lazy(() => import('./components/pages/SheltersListPage'));
const SheltersListTablePage = lazy(() => import('./components/pages/SheltersListTablePage'));
const ShelterDetailsPage = lazy(() => import('./components/pages/ShelterDetailsPage'));
const PetReportPage = lazy(() => import('./components/pages/PetReportPage'));
const PetReportProfilePage = lazy(() => import('./components/pages/PetReportProfilePage'));
const PetReportEditPage = lazy(() => import('./components/pages/PetReportEditPage'));
const PetReportConfirmationPage = lazy(() => import('./components/pages/PetReportConfirmationPage'));
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const RegisterPage = lazy(() => import('./components/pages/RegisterPage'));
const UserProfilePage = lazy(() => import('./components/pages/UserProfilePage'));
const UserFavoritesPage = lazy(() => import('./components/pages/UserFavoritesPage'));
const UserPetReportsPage = lazy(() => import('./components/pages/UserPetReportsPage'));

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#75c6d1',
    },
    secondary: {
      main: '#e8b07d',
    },
    background: {
      default: '#f6f6f6',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Что-то пошло не так.</h2>
          <p>Произошла ошибка при загрузке этой страницы.</p>
          <button 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#75c6d1', 
              border: 'none', 
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = "/"}
          >
            Вернуться на главную
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="dogs" element={<DogAdoptionPage />} />
                  <Route path="cats" element={<CatAdoptionPage />} />
                  <Route path="pets/:id" element={<PetDetailsPage />} />
                  
                  {/* Shelters & Clinics Routes */}
                  <Route path="shelters" element={<SheltersListPage />} />
                  <Route path="shelters/list" element={<SheltersListTablePage />} />
                  <Route path="shelters/map" element={<SheltersMapPage />} />
                  <Route path="shelters/:id" element={<ShelterDetailsPage />} />
                  
                  {/* Pet Report Routes */}
                  <Route path="report" element={<PetReportPage />} />
                  <Route path="reports/:id" element={<PetReportProfilePage />} />
                  <Route path="reports/:id/edit" element={<PetReportEditPage />} />
                  <Route path="report/confirmation" element={<PetReportConfirmationPage />} />
                  
                  {/* Authentication Routes */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  
                  {/* User Routes */}
                  <Route path="profile" element={<UserProfilePage />} />
                  <Route path="favorites" element={<UserFavoritesPage />} />
                  <Route path="my-reports" element={<UserPetReportsPage />} />

                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;