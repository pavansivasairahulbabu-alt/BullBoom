import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Watchlist from '../pages/Watchlist';
import Orders from '../pages/Orders';
import Positions from '../pages/Positions';
import Education from '../pages/Education';
import Category from '../pages/education/Category';
import Topic from '../pages/education/Topic';
import Quiz from '../pages/education/Quiz';
import Profile from '../pages/Profile';
import Dashboard from '../pages/Dashboard';
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/landing/LoginPage';
import SignUpPage from '../pages/landing/SignUpPage';
import ForgotPasswordPage from '../pages/landing/ForgotPasswordPage';
import Chart from '../pages/Chart';
import TradePage from '../pages/trade/TradePage';
import DashboardLayout from '../layouts/DashboardLayout';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/chart/:symbol" element={<Chart />} />
          <Route path="/trade/:type/:symbol" element={<TradePage />} />
          <Route path="/education" element={<Education />} />
          <Route path="/education/category/:id" element={<Category />} />
          <Route path="/education/topic/:id" element={<Topic />} />
          <Route path="/education/quiz/:id" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
