import { useState } from 'react';
import axios from 'axios';

const CreateClubForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', category: 'Tech', description: ''
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); // Clear previous message
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/create-club', formData, {
        headers: { 'x-auth-token': token }
      });
      setMsg('✅ Club Created Successfully!');
      setFormData({ name: '', email: '', password: '', category: 'Tech', description: '' });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || '❌ Failed to create club');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-lg text-center font-bold text-sm ${
          msg.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {msg}
        </div>
      )}
      <input 
        className="w-full bg-zinc-950 p-3 rounded-lg text-white border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors" 
        placeholder="Club Name" 
        value={formData.name} 
        onChange={e => setFormData({...formData, name: e.target.value})} 
        required 
      />
      <input 
        className="w-full bg-zinc-950 p-3 rounded-lg text-white border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors" 
        placeholder="Club Email" 
        type="email"
        value={formData.email} 
        onChange={e => setFormData({...formData, email: e.target.value})} 
        required 
      />
      <input 
        className="w-full bg-zinc-950 p-3 rounded-lg text-white border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors" 
        placeholder="Password" 
        type="password" 
        value={formData.password} 
        onChange={e => setFormData({...formData, password: e.target.value})} 
        required 
      />
      <select 
        className="w-full bg-zinc-950 p-3 rounded-lg text-white border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors" 
        value={formData.category} 
        onChange={e => setFormData({...formData, category: e.target.value})}
      >
        <option value="Tech">Tech</option>
        <option value="Art">Art</option>
        <option value="Music">Music</option>
        <option value="Sports">Sports</option>
        <option value="Science">Science</option>
        <option value="Cultural">Cultural</option>
      </select>
      <textarea 
        className="w-full bg-zinc-950 p-3 rounded-lg text-white border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors resize-none" 
        placeholder="Description" 
        rows="3"
        value={formData.description} 
        onChange={e => setFormData({...formData, description: e.target.value})} 
        required 
      />
      <button 
        type="submit"
        className="w-full bg-indigo-600 p-3 rounded-lg text-white font-bold hover:bg-indigo-700 transition-colors"
      >
        Create Club
      </button>
    </form>
  );
};

export default CreateClubForm;

