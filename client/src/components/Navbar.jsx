import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold">Visitor Management System</div>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/signup" className="hover:text-blue-200">Register Visit</Link>
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="hover:text-blue-200">Admin Dashboard</Link>
                <button onClick={logout} className="hover:text-blue-200">Logout</button>
              </>
            ) : (
              <Link to="/login" className="hover:text-blue-200">Admin Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;