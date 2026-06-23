import { useEffect } from 'react';
import AppRoutes from "./routes/AppRoutes";
import { authApi, orderApi } from './services/api';
import { Toaster, toast } from 'react-hot-toast';

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

  useEffect(() => {
    const checkForAutoExits = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await orderApi.getHistory();
        if (res.success) {
          // Get last checked time from localStorage
          const lastChecked = localStorage.getItem('lastAutoExitCheck');
          const lastCheckedDate = lastChecked ? new Date(lastChecked) : new Date(0);
          
          // Find trades that are auto-exit and happened after last checked
          const newAutoExits = res.trades.filter(trade => 
            trade.source === 'AUTO_EXIT' && new Date(trade.createdAt) > lastCheckedDate
          );

          // Show toasts for new auto-exits
          newAutoExits.forEach(trade => {
            if (trade.status === 'TARGET HIT') {
              toast.success(`🎯 Target Reached! ${trade.symbol} position sold automatically. Profit: ₹${trade.profitLoss?.toFixed(2)}`);
            } else if (trade.status === 'STOP LOSS HIT') {
              toast.error(`🛑 Stop Loss Hit! ${trade.symbol} position sold automatically. Loss: ₹${trade.profitLoss?.toFixed(2)}`);
            }
          });

          // Update last checked time to now
          localStorage.setItem('lastAutoExitCheck', new Date().toISOString());
        }
      } catch (error) {
        console.error('Error checking for auto exits:', error);
      }
    };

    // Check on initial load
    checkForAutoExits();
    // Then check every 5 seconds
    const interval = setInterval(checkForAutoExits, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;