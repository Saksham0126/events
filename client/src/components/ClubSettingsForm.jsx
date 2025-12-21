import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaInstagram, FaLinkedin, FaGlobe, FaPlus, FaTrash } from 'react-icons/fa';
import BannerUploader from './BannerUploader'; // <--- 1. IMPORT THIS

const ClubSettingsForm = ({ currentUser, onUpdate }) => {
  const [formData, setFormData] = useState({
    description: '',
    socials: { instagram: '', linkedin: '', website: '' },
    coreTeam: [] 
  });
  const [banner, setBanner] = useState(''); // <--- 2. NEW STATE FOR BANNER
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      // 3. LOAD EXISTING BANNER
      setBanner(currentUser.bannerUrl || '');
      
      setFormData({
        description: currentUser.description || '',
        socials: currentUser.socials || { instagram: '', linkedin: '', website: '' },
        coreTeam: currentUser.coreTeam || []
      });
    }
  }, [currentUser]);

  const addTeamMember = () => {
    setFormData({ ...formData, coreTeam: [...formData.coreTeam, { name: '', role: '' }] });
  };

  const updateTeamMember = (index, field, value) => {
    const newTeam = [...formData.coreTeam];
    newTeam[index][field] = value;
    setFormData({ ...formData, coreTeam: newTeam });
  };

  const removeTeamMember = (index) => {
    const newTeam = formData.coreTeam.filter((_, i) => i !== index);
    setFormData({ ...formData, coreTeam: newTeam });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/update-profile', formData, {
        headers: { 'x-auth-token': token }
      });
      setMsg('✅ Profile Updated Successfully!');
      if (onUpdate) onUpdate(res.data);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Update Failed');
    }
  };

  return (
    <div className="space-y-8"> {/* Wrapper Div */}
      
      {/* 4. BANNER UPLOADER SECTION */}
      <div>
        <label className="block text-zinc-400 text-xs uppercase font-bold mb-2">Club Cover Photo (Banner)</label>
        <BannerUploader 
          currentBanner={banner} 
          onUpdate={(newUrl) => setBanner(newUrl)} 
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {msg && (
          <div className={`p-3 rounded-lg text-center text-sm font-bold ${
            msg.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {msg}
          </div>
        )}

        {/* About Us */}
        <div>
          <label className="block text-zinc-400 text-xs uppercase font-bold mb-2">About Us / Mission</label>
          <textarea 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Tell students what your club is about..."
          />
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-zinc-400 text-xs uppercase font-bold mb-2">Social Media</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-3 focus-within:border-indigo-500 transition-colors">
              <FaInstagram className="text-pink-500 flex-shrink-0" />
              <input className="bg-transparent p-3 w-full text-white outline-none text-sm" placeholder="Instagram URL" 
                value={formData.socials.instagram} 
                onChange={(e) => setFormData({...formData, socials: {...formData.socials, instagram: e.target.value}})}
              />
            </div>
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-3 focus-within:border-indigo-500 transition-colors">
              <FaLinkedin className="text-blue-500 flex-shrink-0" />
              <input className="bg-transparent p-3 w-full text-white outline-none text-sm" placeholder="LinkedIn URL" 
                value={formData.socials.linkedin} 
                onChange={(e) => setFormData({...formData, socials: {...formData.socials, linkedin: e.target.value}})}
              />
            </div>
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-3 focus-within:border-indigo-500 transition-colors">
              <FaGlobe className="text-zinc-400 flex-shrink-0" />
              <input className="bg-transparent p-3 w-full text-white outline-none text-sm" placeholder="Website URL" 
                value={formData.socials.website} 
                onChange={(e) => setFormData({...formData, socials: {...formData.socials, website: e.target.value}})}
              />
            </div>
          </div>
        </div>

        {/* Core Team */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-zinc-400 text-xs uppercase font-bold">Core Team</label>
            <button type="button" onClick={addTeamMember} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors">
              <FaPlus /> Add Member
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.coreTeam.map((member, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white text-sm flex-1 focus:border-indigo-500 outline-none"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                />
                <input 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white text-sm flex-1 focus:border-indigo-500 outline-none"
                  placeholder="Role"
                  value={member.role}
                  onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                />
                <button type="button" onClick={() => removeTeamMember(index)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                  <FaTrash />
                </button>
              </div>
            ))}
            {formData.coreTeam.length === 0 && <p className="text-zinc-600 text-sm italic">No team members added yet.</p>}
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">
          Save Profile Settings
        </button>
      </form>
    </div>
  );
};

export default ClubSettingsForm;