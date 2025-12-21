import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ClubCard = ({ club }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all group"
    >
      {/* Banner / Header Color */}
      <div 
        className="h-24 bg-zinc-800 relative bg-cover bg-center" 
        style={{ backgroundImage: club.bannerUrl ? `url(${club.bannerUrl})` : 'linear-gradient(to right, #27272a, #18181b)' }}
      >
        <div className="absolute -bottom-10 left-6">
          <img 
            src={club.logoUrl || `https://ui-avatars.com/api/?name=${club.name}&background=random`} 
            alt={club.name} 
            className="w-20 h-20 rounded-xl border-4 border-zinc-900 object-cover bg-zinc-800"
          />
        </div>
      </div>

      <div className="pt-12 px-6 pb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
            {club.name}
          </h3>
          {club.category && (
            <span className="text-xs font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-400 uppercase">
              {club.category}
            </span>
          )}
        </div>
        
        <p className="text-zinc-400 text-sm line-clamp-2 mb-6 h-10">
          {club.description || "A community for students passionate about this field."}
        </p>

        <Link 
          to={`/clubs/${club._id}`}
          className="block w-full py-2 text-center text-sm font-bold text-white bg-zinc-800 rounded-lg hover:bg-white hover:text-black transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default ClubCard;

