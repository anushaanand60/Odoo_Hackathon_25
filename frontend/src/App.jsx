import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';

function App() {
  return (
    <Router>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </motion.div>
    </Router>
  );
}

export default App;