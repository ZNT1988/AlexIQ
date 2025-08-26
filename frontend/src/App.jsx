import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

// Pages
import Homepage from './pages/Homepage';
import ChatPage from './pages/ChatPage';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import NotFound from './pages/NotFound';

// Hooks
import { useAuth } from './hooks/useAuth.jsx';

// i18n
import './i18n/i18n';
import './App.css';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { i18n } = useTranslation();

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Public Route (redirect to dashboard if authenticated)
  const PublicRoute = ({ children }) => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  // Main Layout with Sidebar
  const MainLayout = ({ children }) => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Homepage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />

          {/* Protected Routes with Layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ChatPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Community />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;