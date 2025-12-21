import { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const ApplicationModal = ({ clubId, clubName, onClose }) => {
  const [formData, setFormData] = useState({ studentName: '', studentEmail: '', rollNumber: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/applications/apply', { ...formData, clubId });
      setMessage('✅ Application Sent!');
      setTimeout(onClose, 2000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.msg || 'Failed to submit'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Join {clubName}</h2>
        <p className="text-zinc-400 text-sm mb-6">Fill out this form to apply.</p>

        {message ? (
          <div className={`p-4 rounded-lg text-center font-bold mb-4 ${message.includes('Sent') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Full Name" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
              value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
            
            <input required type="email" placeholder="College Email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
              value={formData.studentEmail} onChange={e => setFormData({...formData, studentEmail: e.target.value})} />
            
            <input required placeholder="Roll Number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
              value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
            
            <textarea required placeholder="Why do you want to join?" rows="3" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none resize-none"
              value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />

            <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
              {loading ? 'Sending...' : <><FaPaperPlane /> Submit Application</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ApplicationModal;
