import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';


const VisitorDashboard = () => {
  const location = useLocation();
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [mailStatus, setMailStatus] = useState('');
  const [saveEmailStatus, setSaveEmailStatus] = useState('');

  useEffect(() => {
    const fetchVisitorDetails = async () => {
      try {
        setLoading(true);
        if (location.state && location.state.visitor) {
          setVisitor(location.state.visitor);
          setEmail(location.state.visitor.email || '');
          setLoading(false);
        } else {
          setError('No visitor data found. Please Login again.');
          setLoading(false);
        }
      } catch (error) {
        setError('Failed to load visitor details.');
        setLoading(false);
      }
    };
    fetchVisitorDetails();
  }, [location.state]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Complete':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Save email to visitor record
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setSaveEmailStatus('');
    if (!email) {
      setSaveEmailStatus('Please enter a valid email address.');
      return;
    }
    try {
      const res = await axios.put(`http://localhost:5000/api/visitors/${visitor.id}/email`, { email });
      if (res.data && res.data.success) {
        setSaveEmailStatus('Email saved successfully!');
        setVisitor({ ...visitor, email });
      } else {
        setSaveEmailStatus('Failed to save email. Please try again.');
      }
    } catch (err) {
      setSaveEmailStatus('Failed to save email. Please try again.');
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    setMailStatus('');
    if (!email) {
      setMailStatus('Please enter a valid email address.');
      return;
    }
    try {
      setMailStatus('Sending PDF to email...');
      const res = await axios.post(`http://localhost:5000/api/visitors/${visitor.id}/sendpdf`, { email });
      if (res.data && res.data.success) {
        setMailStatus('PDF sent successfully!');
      } else {
        setMailStatus('Failed to send PDF. Please try again.');
      }
    } catch (err) {
      setMailStatus('Failed to send PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p>No visitor found. Please login again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Visitor Dashboard</h1>
            <span className="text-sm bg-white text-blue-700 px-3 py-1 rounded-full font-medium">
              Visitor #{visitor.visitorNumber}
            </span>
          </div>
        </div>
        <div className="p-6">
          
          {/* <form onSubmit={handleSaveEmail} className="flex flex-col md:flex-row items-center mb-6 gap-2">
            <input
              type="email"
              placeholder="Enter your email for notifications"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Save Email
            </button>
            {saveEmailStatus && (
              <div className="text-sm mt-2 md:mt-0 md:ml-4">{saveEmailStatus}</div>
            )}
          </form> */}

            <div className="flex flex-col items-center mb-8">
  <h2 className="text-lg font-semibold mb-2">Visitor QR Code</h2>
  <QRCodeSVG
    value={JSON.stringify({
      name: visitor.username,
      idType: visitor.idType,
      idNumber: visitor.idNumber,
      vehicleType: visitor.vehicleType,
      vehicleNumber: visitor.vehicleNumber,
      dateOfVisit: visitor.dateOfVisit,
      inTime: visitor.inTime,
      duration: visitor.duration,
      status: visitor.status,
      visitorNumber: visitor.visitorNumber
    })}
    size={180}
    level="H"
    includeMargin={true}
  />
</div>

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Visit Details</h2>
            <span className={`px-4 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(visitor.status)}`}>
              {visitor.status || 'Pending'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Visitor Name</h3>
                <p className="mt-1 text-lg font-medium">{visitor.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Type</h3>
                <p className="mt-1">{visitor.idType === 'aadhar' ? 'Aadhar Card' : 'PAN Card'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                <p className="mt-1">{visitor.idNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date of Visit</h3>
                <p className="mt-1">{formatDate(visitor.dateOfVisit)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vehicle Type</h3>
                <p className="mt-1">{visitor.vehicleType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vehicle Number</h3>
                <p className="mt-1">{visitor.vehicleNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">In Time</h3>
                <p className="mt-1">{visitor.inTime}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="mt-1">{visitor.duration} minutes</p>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Visit Status Timeline</h3>
            <div className="relative">
              <div className="absolute h-full w-0.5 bg-gray-200 left-7 top-0"></div>
              <div className="relative flex items-start mb-6">
                <div className="h-14 w-14 flex items-center justify-center bg-blue-100 rounded-full border-2 border-blue-500 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 pt-2">
                  <h4 className="text-md font-medium">Registration</h4>
                  <p className="text-sm text-gray-500">Visit request submitted</p>
                  <p className="text-xs text-gray-400">{visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : ''}</p>
                </div>
              </div>
              {visitor.status !== 'Pending' && (
                <div className="relative flex items-start mb-6">
                  <div className={`h-14 w-14 flex items-center justify-center rounded-full border-2 z-10 ${
                    visitor.status === 'Approved' || visitor.status === 'Complete' 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-red-100 border-red-500'
                  }`}>
                    {visitor.status === 'Approved' || visitor.status === 'Complete' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4 pt-2">
                    <h4 className="text-md font-medium">
                      {visitor.status === 'Approved' || visitor.status === 'Complete' ? 'Approved' : 'Rejected'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {visitor.status === 'Approved' || visitor.status === 'Complete' 
                        ? 'Your visit was approved' 
                        : 'Your visit request was rejected'}
                    </p>
                    <p className="text-xs text-gray-400">Status updated</p>
                  </div>
                </div>
              )}
              {visitor.status === 'Complete' && (
                <div className="relative flex items-start">
                  <div className="h-14 w-14 flex items-center justify-center bg-blue-100 rounded-full border-2 border-blue-500 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 pt-2">
                    <h4 className="text-md font-medium">Visit Completed</h4>
                    <p className="text-sm text-gray-500">Visit marked as complete</p>
                    <p className="text-xs text-gray-400">Thank you for your visit</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {visitor.status === 'Complete' && (
            <div className="mt-8 text-center space-y-4">
              <button 
                onClick={() => window.location.href = `http://localhost:5000/api/visitors/${visitor.id}/pdf`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Download Visit PDF
              </button>
              <form onSubmit={handleSendMail} className="flex flex-col items-center space-y-2 mt-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
                >
                  Send PDF to Email
                </button>
                {mailStatus && (
                  <div className="text-sm mt-2">{mailStatus}</div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default VisitorDashboard;