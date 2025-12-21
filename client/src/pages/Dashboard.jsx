import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UploadForm from '../components/UploadForm';
import CreateClubForm from '../components/CreateClubForm';
import ClubSettingsForm from '../components/ClubSettingsForm';
import ApplicationsList from '../components/ApplicationsList';
import LogoUploader from '../components/LogoUploader';
import { FaTrash, FaEye } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [role, setRole] = useState('club_admin'); // Default to normal admin
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'settings'
  
  // Stats (calculated from real data now)
  const stats = {
    posts: myPosts.length,
    pending: 5, // Placeholder for now
    members: 142 // Placeholder for now
  };

  // 1. Fetch Data Function (can be called on load and after upload)
  const fetchMyPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await axios.get('http://localhost:5000/api/posts/my-posts', {
        headers: { 'x-auth-token': token }
      });
      setMyPosts(res.data);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  // Fetch on Load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Get role from localStorage (set during login)
    const userRole = localStorage.getItem('userRole');
    setRole(userRole || 'club_admin');
    
    const fetchData = async () => {
      try {
        // A. Get My Profile (For the Logo and Club Info)
        const userRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        setCurrentUser(userRes.data);

        // B. Get My Posts (only if not super_admin)
        if (userRole !== 'super_admin') {
          fetchMyPosts();
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    };
    
    fetchData();
  }, [navigate]);

  // 2. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // 3. Handle Delete
  const handleDelete = async (postId) => {
    if(!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { 'x-auth-token': token }
      });
      // Remove from UI immediately without refreshing
      setMyPosts(myPosts.filter(post => post._id !== postId));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          
          <div className="flex items-center gap-4">
            {/* LOGO UPLOADER - Only show for club admins */}
            {currentUser && role !== 'super_admin' && (
              <LogoUploader 
                currentLogo={currentUser.logoUrl} 
                clubName={currentUser.name}
                onUpdate={(newUrl) => setCurrentUser({...currentUser, logoUrl: newUrl})} 
              />
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-white">
                {role === 'super_admin' ? "Super Admin Panel" : "Club Dashboard"}
              </h1>
              <p className="text-zinc-500 text-sm">Welcome back, {currentUser?.name || 'Admin'}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-colors">
            Logout
          </button>
        </div>

        {/* Stats Grid - Only show for club admins */}
        {role !== 'super_admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-zinc-500 text-sm font-bold uppercase">Total Posts</h3>
              <p className="text-4xl font-bold text-white mt-2">{stats.posts}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-zinc-500 text-sm font-bold uppercase">Pending Applications</h3>
              <p className="text-4xl font-bold text-indigo-400 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
               <h3 className="text-zinc-500 text-sm font-bold uppercase">Members</h3>
               <p className="text-4xl font-bold text-emerald-400 mt-2">{stats.members}</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Switch based on Role */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-fit">
            {role === 'super_admin' ? (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Register New Club</h2>
                <CreateClubForm />
              </>
            ) : (
              <>
                {/* TABS */}
                <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-2 overflow-x-auto">
                  {['posts', 'settings', 'applications'].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)} 
                      className={`text-sm font-bold pb-2 capitalize whitespace-nowrap ${
                        activeTab === tab ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {tab === 'applications' ? 'Applications' : tab === 'posts' ? 'Create Post' : 'Settings'}
                    </button>
                  ))}
                </div>

                {/* CONTENT SWITCHER */}
                {activeTab === 'posts' && <UploadForm onUploadSuccess={fetchMyPosts} />}
                
                {activeTab === 'settings' && (
                  role === 'super_admin' ? <CreateClubForm /> : <ClubSettingsForm currentUser={currentUser} onUpdate={(updatedClub) => setCurrentUser(updatedClub)} />
                )}
                
                {activeTab === 'applications' && <ApplicationsList />}
              </>
            )}
          </div>

          {/* Right: Recent Posts List - Only for club admins */}
          {role !== 'super_admin' && (
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-fit">
              <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {myPosts.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10">No posts yet. Upload one!</div>
                ) : (
                  myPosts.map((post) => (
                    <div key={post._id} className="flex gap-4 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors group">
                      
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
                        {post.mediaType === 'video' ? (
                          <video src={post.mediaUrl} className="w-full h-full object-cover opacity-50" />
                        ) : (
                          <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{post.caption || "No Caption"}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {new Date(post.createdAt).toLocaleDateString()} • {post.mediaType}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => window.open(post.mediaUrl, '_blank')} className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white">
                            <FaEye /> View
                          </button>
                          <button onClick={() => handleDelete(post._id)} className="text-xs flex items-center gap-1 text-zinc-400 hover:text-red-400">
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
