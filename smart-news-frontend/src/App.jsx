import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
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

function AppWrapper() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/news" element={<Home />} />
        <Route path="/news/:kategori/:id" element={<NewsDetails />} />
        <Route path="/news/:kategori" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
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
