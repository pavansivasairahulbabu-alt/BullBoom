
import { getDashboardStats } from '../services/dashboard.service.js';

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await getDashboardStats(userId);
    
    res.status(200).json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Dashboard Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};
