import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, showMessage, api } from '../services/api'; 
import { signInWithGoogle } from '../services/authGoogle';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await loginUser({ email, password }); 
      console.log('Login successful response from backend:', response); 

      const user = response.user || response;
      if (user && user.token && user.username && user._id) {
        localStorage.setItem('user', JSON.stringify(user));
        showMessage(response.message || 'Login berhasil!', 'success'); 

        setTimeout(() => {
          navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard'); 
        }, 50);
      } else {
        showMessage('Login berhasil, tapi data tidak lengkap.', 'warning');
        console.warn('Login response did not contain expected token or user data:', response);
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.'); 
      showMessage(err.message || 'Login gagal. Silakan coba lagi.', 'error');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const firebaseResult = await signInWithGoogle();
      console.log("Hasil Google login:", firebaseResult);

      const googleUser = firebaseResult?.user;

      if (!googleUser || !googleUser.email || !googleUser.uid) {
        showMessage('Data dari Google tidak lengkap.', 'error');
        return;
      }

      const response = await api.post('/auth/google', {
        email: googleUser.email,
        uid: googleUser.uid,
        username: googleUser.displayName || googleUser.email.split('@')[0],
      });

      const user = response.data?.user || response.data;
      if (user?.token) {
        localStorage.setItem('user', JSON.stringify(user));
        showMessage('Login dengan Google berhasil!', 'success');
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      } else {
        showMessage('Login Google gagal: token tidak diterima.', 'error');
      }
    } catch (err) {
      console.error('Google Sign-in error:', err);
      showMessage('Gagal login dengan Google', 'error');
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Kata Sandi:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isLoading ? 'Memuat...' : 'Login'}
            </button>
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="bg-white border flex justify-center items-center gap-2 text-black font-medium px-4 py-2 rounded-md shadow-md hover:shadow-lg transition"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" className="w-5 h-5" />
              Masuk dengan Google
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Daftar Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
