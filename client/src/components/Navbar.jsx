import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isVisitorLoggedIn =
    location.pathname === '/dashboard' &&
    location.state &&
    location.state.visitor;

  useEffect(() => {
    if (dropdownOpen) {
      dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 1500);
    }
    return () => clearTimeout(dropdownTimeout.current);
  }, [dropdownOpen]);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold">Visitor Management System</div>
          <div className="flex space-x-4 items-center">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="hover:text-blue-200 px-3 py-2 rounded inline-flex items-center focus:outline-none"
              >
                Visitor
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg z-20">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/signup'); }}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                  >
                    New Register
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/visitorlogin'); }}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                  >
                    Visitor Login
                  </button>
                </div>
              )}
            </div>
            {!isVisitorLoggedIn && (
              isAuthenticated ? (
                <>
                  <Link to="/admin" className="hover:text-blue-200">Admin Dashboard</Link>
                  <button onClick={logout} className="hover:text-blue-200">Logout</button>
                </>
              ) : (
                <Link to="/login" className="hover:text-blue-200">Admin Login</Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;