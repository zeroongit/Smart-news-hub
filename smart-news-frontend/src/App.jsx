import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NewsList from './pages/news/NewsList';
import NewsDetails from './pages/news/NewsDetails';
import NewsCreate from './pages/news/NewsCreate';
import Absensi from './pages/Absensi';
import Job from './pages/Job';
import Profile from './pages/Profile';
import NewsEdit from './pages/news/NewsEdit';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash / Welcome */}
        <Route path="/" element={<WelcomeScreen />} />

        {/* Public Pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/news" element={<NewsList />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Pages */}
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
          path="/absensi"
          element={
            <PrivateRoute>
              <Absensi />
            </PrivateRoute>
          }
        />
        <Route
        path='/news/:id/edit'
        element={
          <PrivateRoute>
            <NewsEdit />
          </PrivateRoute>
        }
        />
        <Route
          path="/job"
          element={
            <PrivateRoute>
              <Job />
            </PrivateRoute>
          }
        />
        <Route
        path='/admin/dashboard'
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
