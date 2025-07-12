import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../../../../Front-end/src/context/AppContext';
import { toast } from 'react-toastify';
import './settings.css'

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { backendUrl } = useContext(AppContent);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/settings/config');
        setMaintenanceMode(res.data.maintenance);
        setEmailNotifications(res.data.email_notifications); 
      } catch (err) {
        console.error('Failed to check maintenance mode');
      }
    };
    checkMaintenance();
  }, [backendUrl]);

  const handleMaintenanceToggle = async () => {
    try {
      const updated = !maintenanceMode;
      await axios.post(backendUrl + '/api/settings/update', { maintenance: updated });
      setMaintenanceMode(updated);
      toast.success(`Maintenance Mode ${updated ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      toast.error('Failed to update maintenance mode');
    }
  };

  const handleEmailToggle = async () => {
    try {
      const updated = !emailNotifications;
      const response = await axios.post(`${backendUrl}/api/settings/update-email`, {
        email_notifications: updated, // This matches the backend expectation
      });
      
      if (response.data.success) {
        setEmailNotifications(updated);
        toast.success(`Email Notifications ${updated ? 'Enabled' : 'Disabled'}`);
      } else {
        toast.error(response.data.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email notifications');
    }
  };


  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Admin Settings</h2>

      <div className="space-y-6">
        {/* Email Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive admin alerts via email</p>
          </div>
          <label className="slider-toggle">
            <input
              type="checkbox"
              checked={!emailNotifications}
              onChange={handleEmailToggle}
            />
            <span className="slider"></span>
            </label>
        </div>

        {/* Maintenance Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Maintenance Mode</p>
            <p className="text-sm text-gray-500">Temporarily disable the frontend</p>
          </div>
          <label className="slider-toggle">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={handleMaintenanceToggle}
            />
             <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
