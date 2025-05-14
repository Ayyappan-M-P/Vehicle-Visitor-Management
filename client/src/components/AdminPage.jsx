import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { isAuthenticated } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchVisitors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/visitors');
        setVisitors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching visitors:', error);
        setLoading(false);
      }
    };

    fetchVisitors();
  }, [isAuthenticated]);

  const handleStatusChange = async (visitorId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/visitors/${visitorId}/status`, { status: newStatus });
      setVisitors(visitors.map(visitor => 
        visitor.id === visitorId ? { ...visitor, status: newStatus } : visitor
      ));
    } catch (error) {
      console.error('Error updating visitor status:', error);
    }
  };

  const handleDelete = async (visitorId) => {
    if (window.confirm('Are you sure you want to delete this visitor record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/visitors/${visitorId}`);
        setVisitors(visitors.filter(visitor => visitor.id !== visitorId));
      } catch (error) {
        console.error('Error deleting visitor:', error);
      }
    }
  };

  const generatePdf = async (visitorId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/visitors/${visitorId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visitor-${visitorId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const filteredVisitors = filter === 'all' 
    ? visitors 
    : visitors.filter(visitor => visitor.status?.toLowerCase() === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-4">
        <label className="mr-2">Filter by status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="complete">Complete</option>
        </select>
      </div>
      
      {loading ? (
        <p className="text-center">Loading visitor data...</p>
      ) : filteredVisitors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Visitor #</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Vehicle</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Duration</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{visitor.visitorNumber}</td>
                  <td className="py-3 px-4">{visitor.username}</td>
                  <td className="py-3 px-4">
                    {visitor.idType}: {visitor.idNumber}
                  </td>
                  <td className="py-3 px-4">
                    {visitor.vehicleType} - {visitor.vehicleNumber}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(visitor.dateOfVisit).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{visitor.duration} min</td>
                  <td className="py-3 px-4">
                    <span className={`py-1 px-2 rounded-full text-xs ${
                      visitor.status === 'Complete' ? 'bg-green-200 text-green-700' : 
                      visitor.status === 'Approved' ? 'bg-blue-200 text-blue-700' :
                      visitor.status === 'Rejected' ? 'bg-red-200 text-red-700' : 
                      'bg-yellow-200 text-yellow-700'
                    }`}>
                      {visitor.status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {visitor.status !== 'Approved' && visitor.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusChange(visitor.id, 'Approved')}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
                        >
                          Approve
                        </button>
                      )}
                      
                      {visitor.status !== 'Rejected' && visitor.status !== 'Complete' && (
                        <button
                          onClick={() => handleStatusChange(visitor.id, 'Rejected')}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
                        >
                          Reject
                        </button>
                      )}
                      
                      {visitor.status === 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(visitor.id, 'Complete')}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
                        >
                          Complete
                        </button>
                      )}
                      
                      {visitor.status === 'Complete' && (
                        <button
                          onClick={() => generatePdf(visitor.id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded"
                        >
                          PDF
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(visitor.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center">No visitor records found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;