import { useEffect } from 'react';
import AppRoutes from "./routes/AppRoutes";
import { authApi } from './services/api';
import { Toaster, toast } from 'react-hot-toast';
import { socketService } from './services/socketService';

function App() {
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.validateToken();
          if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
            // Connect to Socket.IO for real-time trigger updates
            socketService.connect(token);
            
            // Listen for trigger execution notifications
            socketService.on('triggerExecuted', (data) => {
              if (data.orderType === 'BUY') {
                toast.success(data.message || `🟢 BUY Trigger Executed: ${data.symbol}`, { duration: 5000 });
              } else {
                toast.success(data.message || `🔴 SELL Trigger Executed: ${data.symbol}`, { duration: 5000 });
              }
            });

            socketService.on('triggerCancelled', (data) => {
              toast.error(`⚠️ Trigger Cancelled: ${data.symbol} - ${data.reason}`, { duration: 5000 });
            });
          } else {
             socketService.disconnect();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          socketService.disconnect();
        }
      } else {
        socketService.disconnect();
      }
    };
    validateToken();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;