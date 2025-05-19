import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminPage';
import NavBar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Visitorlogin from './components/Oldvisitor';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <NavBar />
          <div className="container mx-auto py-8 px-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path='/visitorlogin' element={<Visitorlogin />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;