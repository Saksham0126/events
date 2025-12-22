import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaUserShield } from 'react-icons/fa';

const CreateClubForm = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // List State
  const [clubs, setClubs] = useState([]);
  const [msg, setMsg] = useState('');

  // 1. Fetch Clubs on Load
  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/all-clubs', {
        headers: { 'x-auth-token': token }
      });
      setClubs(res.data);
    } catch (err) {
      console.error("Failed to fetch clubs");
    }
  };

  // 2. Create Club Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/register-club', formData, {
        headers: { 'x-auth-token': token }
      });
      setMsg('✅ Club Created Successfully!');
      setFormData({ name: '', email: '', password: '' }); // Reset form
      fetchClubs(); // Refresh list
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.msg || 'Failed to create club'));
    }
  };

  // 3. Delete Club Logic
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/auth/user/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setClubs(clubs.filter(club => club._id !== id)); // Remove from UI
      setMsg(`🗑️ Deleted ${name}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert("Failed to delete club");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: CREATE FORM */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaUserShield className="text-indigo-500" /> Create New Club Account
        </h3>
        
        {msg && <div className="mb-4 p-3 bg-zinc-800 text-white rounded text-center font-bold border border-zinc-700">{msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Club Name</label>
            <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-1">Login Email</label>
              <input required type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">Password</label>
              <input required type="password" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <FaPlus /> Create Account
          </button>
        </form>
      </div>

      {/* SECTION 2: MANAGE EXISTING CLUBS */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Manage Existing Clubs</h3>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {clubs.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">No clubs found.</p>
          ) : (
            clubs.map(club => (
              <div key={club._id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex justify-between items-center group hover:border-zinc-700 transition-colors">
                <div>
                  <h4 className="font-bold text-white">{club.name}</h4>
                  <p className="text-sm text-zinc-500">{club.email}</p>
                </div>
                
                <button 
                  onClick={() => handleDelete(club._id, club.name)}
                  className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete Club"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default CreateClubForm;