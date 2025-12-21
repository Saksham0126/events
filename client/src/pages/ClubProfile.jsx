import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import ApplicationModal from '../components/ApplicationModal'; // Ensure this path is correct
import { FaUsers, FaCalendarAlt, FaInstagram, FaLinkedin, FaGlobe } from 'react-icons/fa';

const ClubProfile = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal State

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Club Details
        const clubRes = await axios.get(`http://localhost:5000/api/auth/club/${id}`);
        setClub(clubRes.data);

        // 2. Get Club Posts
        const postsRes = await axios.get(`http://localhost:5000/api/posts/club/${id}`);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading Profile...</div>;
  if (!club) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Club Not Found</div>;

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20">
      
      {/* 1. HERO SECTION (With Banner) */}
      <div 
        className="relative bg-zinc-900 border-b border-zinc-800 mb-10 bg-cover bg-center"
        style={{ 
          backgroundImage: club.bannerUrl ? `url(${club.bannerUrl})` : 'none' 
        }}
      >
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
          
          {/* Logo */}
          <img 
            src={club.logoUrl || `https://ui-avatars.com/api/?name=${club.name}&background=random&size=200`} 
            alt={club.name}
            className="w-32 h-32 rounded-full border-4 border-zinc-800 shadow-xl object-cover bg-zinc-800"
          />

          {/* Club Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{club.name}</h1>
            
            <p className="text-zinc-300 text-lg max-w-2xl mb-4 leading-relaxed">
              {club.description || "Building a community of passionate learners and creators."}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-medium text-zinc-500 mb-4">
              <span className="flex items-center gap-2"><FaUsers className="text-indigo-500" /> Member since 2024</span>
              <span className="flex items-center gap-2"><FaCalendarAlt className="text-indigo-500" /> Active this week</span>
            </div>

            {/* Social Links */}
            {club.socials && (
              <div className="flex justify-center md:justify-start gap-4">
                {club.socials.instagram && (
                  <a href={club.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors text-2xl">
                    <FaInstagram />
                  </a>
                )}
                {club.socials.linkedin && (
                  <a href={club.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-500 transition-colors text-2xl">
                    <FaLinkedin />
                  </a>
                )}
                {club.socials.website && (
                  <a href={club.socials.website} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors text-2xl">
                    <FaGlobe />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Apply Button (Opens Modal) */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-indigo-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Apply to Join
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 2. LEFT COLUMN: CORE TEAM */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUsers className="text-indigo-500" /> Core Team
            </h3>
            
            {club.coreTeam && club.coreTeam.length > 0 ? (
              <div className="space-y-4">
                {club.coreTeam.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm italic">Team members not listed.</p>
            )}
          </div>
        </div>

        {/* 3. RIGHT COLUMN: LATEST ACTIVITIES */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">
            Latest Activities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post._id} post={{...post, clubId: club}} /> 
              ))
            ) : (
              <div className="col-span-full py-10 text-center bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                <p className="text-zinc-500">No updates posted yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. MODAL RENDER */}
      {isModalOpen && (
        <ApplicationModal 
          clubId={club._id} 
          clubName={club.name} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

    </div>
  );
};

export default ClubProfile;