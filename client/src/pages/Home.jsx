import { useEffect, useState } from 'react';
import axios from 'axios';
import HeroCarousel from '../components/HeroCarousel';
import PostCard from '../components/PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/posts/feed');
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="h-screen bg-zinc-950 flex items-center justify-center text-white">Loading content...</div>;

  return (
    <div className="bg-zinc-950 min-h-screen pb-20">
      
      {/* 1. Hero Section (Top 5 posts) */}
      <HeroCarousel posts={posts.slice(0, 5)} />

      {/* 2. The Main Feed */}
      <div className="max-w-7xl mx-auto px-4 pt-24">
        
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Latest Happenings</h2>
            <p className="text-zinc-400 mt-2">Catch up with what clubs are doing on campus.</p>
          </div>
          
          {/* Filter Buttons (Visual only for now) */}
          <div className="hidden md:flex gap-2">
            <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full">All</button>
            <button className="px-4 py-2 bg-zinc-900 text-zinc-400 text-sm font-bold rounded-full border border-zinc-800 hover:border-zinc-600">Events</button>
            <button className="px-4 py-2 bg-zinc-900 text-zinc-400 text-sm font-bold rounded-full border border-zinc-800 hover:border-zinc-600">News</button>
          </div>
        </div>

        {/* 3. The Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {posts.map((post) => (
             <PostCard key={post._id} post={post} />
           ))}
        </div>

        {/* Empty State Check */}
        {posts.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            No posts found. Admins need to upload something!
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="mt-20 py-8 text-center border-t border-zinc-900">
        <p className="text-zinc-600 text-sm font-medium tracking-wide">
          Made with <span className="text-red-500 animate-pulse">♥</span> by <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Saksham</span>
        </p>
      </footer>

    </div>
  );
};

export default Home;

