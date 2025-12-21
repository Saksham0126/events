import { useState } from 'react';
import axios from 'axios';
import { FaCamera, FaSpinner } from 'react-icons/fa';

const LogoUploader = ({ currentLogo, onUpdate, clubName }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/update-logo', formData, {
        headers: { 'x-auth-token': token }
      });
      
      // Notify parent component to update the UI
      onUpdate(res.data.logoUrl);
      
    } catch (err) {
      console.error("Logo upload failed", err);
      alert("Failed to update logo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group w-24 h-24 flex-shrink-0">
      {/* The Image */}
      <img 
        src={currentLogo || `https://ui-avatars.com/api/?name=${clubName || 'Club'}&background=random`} 
        alt="Club Logo" 
        className="w-full h-full rounded-full object-cover border-4 border-zinc-800 shadow-lg"
      />

      {/* The Overlay (appears on hover) */}
      <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
        {loading ? (
          <FaSpinner className="text-white animate-spin text-xl" />
        ) : (
          <FaCamera className="text-white text-xl" />
        )}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={loading}
        />
      </label>
    </div>
  );
};

export default LogoUploader;

