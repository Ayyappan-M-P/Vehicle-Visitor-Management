import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Visitor Management System</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Visitors</h2>
        {loading ? (
          <p className="text-center">Loading visitor data...</p>
        ) : visitors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Visitor ID</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Vehicle Type</th>
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className='py-3 px-6 text-left'>In Time</th>
                  <th className='py-3 px-6 text-left'>Out Time</th> 
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {visitors.map((visitor) => {
                  let formattedTime = '';
                  let formattedOutTime = '';
                  if (visitor.inTime) {
                    const [hour, minute] = visitor.inTime.split(':').map(Number);
                    const inDate = new Date();
                    inDate.setHours(hour, minute, 0, 0);
                    formattedTime = inDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                    if (visitor.duration) {
                      const outDate = new Date(inDate.getTime() + Number(visitor.duration) * 60000);
                      formattedOutTime = outDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                    }
                  }
                  return (
                    <tr key={visitor.id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6">{visitor.visitorNumber}</td>
                      <td className="py-3 px-6">{visitor.username}</td>
                      <td className="py-3 px-6">{visitor.vehicleType}</td>
                      <td className="py-3 px-6">{new Date(visitor.dateOfVisit).toLocaleDateString()}</td>
                      <td className="py-3 px-6">
                        <span className={`py-1 px-3 rounded-full text-xs ${
                          visitor.status === 'Complete' ? 'bg-green-200 text-green-700' : 
                          visitor.status === 'Approved' ? 'bg-blue-200 text-blue-700' :
                          visitor.status === 'Rejected' ? 'bg-red-200 text-red-700' : 
                          'bg-yellow-200 text-yellow-700'
                        }`}>
                          {visitor.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        {formattedTime}
                      </td>
                      <td className="py-3 px-6">
                        {formattedOutTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">No visitor records found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;

