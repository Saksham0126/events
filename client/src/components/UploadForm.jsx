import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Please select a file first.');

    setLoading(true);
    setMessage(''); // Clear previous messages

    // 1. Prepare Form Data
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('file', file); // 'file' matches upload.single('file') in backend

    try {
      const token = localStorage.getItem('token');
      
      console.log("🚀 SENDING Upload Request...");

      // 2. The Request (Using the URL that worked in your Ping Test)
      const res = await axios.post('http://localhost:5000/api/posts/create', formData, {
        headers: {
          'x-auth-token': token
          // IMPORTANT: Do NOT manually set Content-Type. Axios does it automatically.
        }
      });

      console.log("✅ UPLOAD SUCCESS:", res.data);
      setMessage('Upload Successful! 🎉');
      setFile(null);
      setCaption('');
      
      // Refresh the posts list if callback provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (err) {
      console.error("❌ UPLOAD FAILED:", err);
      const errorMsg = err.response?.data?.msg || "Server connection failed";
      setMessage(`Failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center">
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center font-bold text-sm ${
          message.includes('Success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
          <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
            file ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800'
          }`}>
            {file ? (
              <><FaCheckCircle className="text-3xl text-indigo-500 mb-2" /><span className="text-sm text-indigo-300 truncate max-w-xs">{file.name}</span></>
            ) : (
              <><FaCloudUploadAlt className="text-3xl text-zinc-500 mb-2" /><span className="text-sm text-zinc-500">Click to upload</span></>
            )}
          </div>
        </div>

        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption..." rows="2" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"/>

        <button type="submit" disabled={loading || !file} className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${
            loading ? 'bg-zinc-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}>
          {loading ? <><FaSpinner className="animate-spin" /> Uploading...</> : 'Post Update'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
