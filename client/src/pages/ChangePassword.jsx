import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock } from 'react-icons/fa';

const ChangePassword = () => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const { newPassword, confirmPassword } = formData;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      // Call the backend route we just created
      await axios.put(
        'http://localhost:5000/api/auth/change-initial-password',
        { newPassword },
        config
      );

      setMessage({ type: 'success', text: 'Password updated! Redirecting...' });
      
      // Wait 2 seconds then go to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.msg || 'Error updating password' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <FaLock className="text-2xl text-yellow-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Security Update Required</h2>
          <p className="text-zinc-400 mt-2 text-sm">
            This is your first login. Please set a permanent password to secure your account.
          </p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-bold ${
            message.type === 'error' 
              ? 'bg-red-500/10 border border-red-500/50 text-red-500' 
              : 'bg-green-500/10 border border-green-500/50 text-green-500'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Set New Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;