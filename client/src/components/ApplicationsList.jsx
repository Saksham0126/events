import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      // We need to create this route first or assume it exists. 
      // Based on the prompt, the user didn't ask for a GET route, but we need one.
      // I'll create a simple GET route in the backend as part of this step proactively.
      const res = await axios.get('http://localhost:5000/api/applications/my-applications', {
        headers: { 'x-auth-token': token }
      });
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/applications/${id}/status`, 
        { status }, 
        { headers: { 'x-auth-token': token } }
      );
      // Update local state
      setApplications(apps => apps.map(app => 
        app._id === id ? { ...app, status } : app
      ));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="text-center text-zinc-500 py-10"><FaSpinner className="animate-spin inline mr-2"/> Loading applications...</div>;

  return (
    <div className="space-y-4">
       <h2 className="text-xl font-bold text-white mb-4">Incoming Applications</h2>
       
       {applications.length === 0 ? (
         <div className="text-center text-zinc-500 py-10 bg-zinc-950/30 rounded-lg border border-zinc-800 border-dashed">
           No applications yet.
         </div>
       ) : (
         applications.map(app => (
           <div key={app._id} className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-white">{app.studentName}</h3>
                 <p className="text-xs text-zinc-500">{app.rollNumber} • {app.studentEmail}</p>
               </div>
               <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                 app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                 app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                 'bg-yellow-500/20 text-yellow-400'
               }`}>
                 {app.status}
               </span>
             </div>
             
             <div className="bg-zinc-900 p-3 rounded text-sm text-zinc-300">
               "{app.reason}"
             </div>

             {app.status === 'pending' && (
               <div className="flex gap-2 mt-1">
                 <button 
                   onClick={() => handleStatusUpdate(app._id, 'accepted')}
                   className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                   <FaCheck /> Accept
                 </button>
                 <button 
                   onClick={() => handleStatusUpdate(app._id, 'rejected')}
                   className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                   <FaTimes /> Reject
                 </button>
               </div>
             )}
           </div>
         ))
       )}
    </div>
  );
};

export default ApplicationsList;
