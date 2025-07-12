import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Search from './components/Search';
import RequestForm from './components/RequestForm';
import AdminDashboard from './components/AdminDashboard';
import { LayoutProvider } from './components/Layout';

function App() {
  return (
    <Router>
      <LayoutProvider>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/requests" element={<RequestForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </motion.div>
      </LayoutProvider>
    </Router>
  );
}

export default App;