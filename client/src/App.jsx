import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClubsDirectory from './pages/ClubsDirectory';
import ClubProfile from './pages/ClubProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clubs" element={<ClubsDirectory />} />
          <Route path="/clubs/:id" element={<ClubProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
