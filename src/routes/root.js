import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import Dashboard from '../pages/dashboard';
import UserProfile from '../pages/userProfile';
import Layout from '../layout/layout'
import Recipes from '../pages/recipes';
import MealPlans from '../pages/mealPlans';


const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const isAuthenticated = token ? true : false;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

function Root() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout>
              <Outlet />
            </Layout>
          </ProtectedRoute>
        }
      >
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/mealPlans" element={<MealPlans />} />
       </Route>
    </Routes>
  );
}

export default Root;
