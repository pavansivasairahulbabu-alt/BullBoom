import { useEffect } from 'react';
import AppRoutes from "./routes/AppRoutes";
import { authApi } from './services/api';

function App() {
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.validateToken();
          if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        } catch (error) {
          console.error('Token validation failed:', error);
        }
      }
    };
    validateToken();
  }, []);

  return <AppRoutes />;
}

export default App;