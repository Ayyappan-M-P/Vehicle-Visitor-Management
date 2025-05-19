import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Oldvisitor = () => {
  const [formData, setFormData] = useState({ name: '', aadhar: '', vehicleNumber: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/oldvisitor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          aadhar: formData.aadhar,
          vehicleNumber: formData.vehicleNumber,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Login successful!');
        setTimeout(() => {
          navigate('/dashboard', { state: { visitor: data.visitor } });
        }, 1000);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Previous Visitor Login</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Aadhar Number</label>
          <input
            type="text"
            name="aadhar"
            value={formData.aadhar}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={12}
            maxLength={12}
            pattern="\d{12}"
            title="Enter 12-digit Aadhar Number"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-gray-700">Vehicle Number</label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Oldvisitor;