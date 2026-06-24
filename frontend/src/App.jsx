import { useEffect } from 'react';
import AppRoutes from "./routes/AppRoutes";
import { authApi, orderApi } from './services/api';
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