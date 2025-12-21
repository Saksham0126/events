import { useState } from 'react';
import axios from 'axios';
import { FaCamera, FaSpinner } from 'react-icons/fa';

const BannerUploader = ({ currentBanner, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      // Use existing API URL convention if possible, but hardcoding for now as per instructions
      // Ideally should be `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/update-banner`
      const res = await axios.put('http://localhost:5000/api/auth/update-banner', formData, {
        headers: { 'x-auth-token': token }
      });
      onUpdate(res.data.bannerUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to update banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-6 group bg-zinc-800 border border-zinc-700">
      {/* Current Banner or Default Gradient */}
      {currentBanner ? (
        <img src={currentBanner} alt="Banner" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-center text-zinc-500 text-sm">
          No Banner Set
        </div>
      )}

      {/* Overlay Button */}
      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        {loading ? <FaSpinner className="animate-spin text-white text-2xl" /> : <FaCamera className="text-white text-2xl mb-2" />}
        <span className="text-white text-xs font-bold uppercase">Change Cover Photo</span>
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={loading} />
      </label>
    </div>
  );
};

export default BannerUploader;
