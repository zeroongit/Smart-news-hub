import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import WelcomeScreen from './pages/WelcomeScreen';
import Home from './pages/Home';
import NewsDetails from './pages/news/NewsDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import NewsCreate from './pages/news/NewsCreate';
import NewsEdit from './pages/news/NewsEdit';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import ParticlesBackground from './components/ParticlesBackground'; 

function AppWrapper() {
  const location = useLocation();

  // Jangan tampilkan partikel di halaman Welcome
  const hideParticles = location.pathname === '/';

  return (
    <>
      {!hideParticles && <ParticlesBackground />}

      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/news" element={<Home />} />
        <Route path="/news/:kategori/:id" element={<NewsDetails />} />
        <Route path="/news/:kategori" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected */}
        <Route
          path="/news/create"
          element={
            <PrivateRoute>
              <NewsCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/news/:categorySlug/:id/edit"
          element={
            <PrivateRoute>
              <NewsEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
