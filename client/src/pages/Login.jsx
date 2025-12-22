import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUniversity } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      console.log('Login Response:', res.data); // Debugging

      // 1. Save Token
      localStorage.setItem('token', res.data.token);
      
      if (res.data.role) {
        localStorage.setItem('userRole', res.data.role);
      }

      // 2. CHECK THE FLAG: Do they need to change password?
      if (res.data.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.msg || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FaUniversity className="text-4xl text-indigo-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Access</h2>
          <p className="text-zinc-400 mt-2">Enter your credentials to manage your club.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-center text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="name@college.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          Not an admin? <Link to="/" className="text-indigo-400 hover:underline">Return Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;