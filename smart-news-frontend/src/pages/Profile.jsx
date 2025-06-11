// smart-news-frontend/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    // State untuk field profil
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState(''); // Sesuai schema
    const [profilePictureUrl, setProfilePictureUrl] = useState(''); // Sesuai schema
    const [website, setWebsite] = useState(''); // Sesuai schema
    const [instagram, setInstagram] = useState(''); // Bagian dari socialMedia
    const [linkedin, setLinkedin] = useState(''); // Bagian dari socialMedia

    const [isEditing, setIsEditing] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleUnauthorized = () => {
        localStorage.clear();
        alert('Sesi Anda telah berakhir atau tidak valid. Mohon login kembali.');
        navigate('/login');
    };

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
            handleUnauthorized();
            return;
        }

        try {
            const res = await fetch(`smart-news-backend.vercel.app/api/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setName(data.name);
                setEmail(data.email);
                setBio(data.bio || ''); // Inisialisasi dengan string kosong jika null/undefined
                setProfilePictureUrl(data.profilePictureUrl || '');
                setWebsite(data.website || '');
                setInstagram(data.socialMedia?.instagram || ''); // Akses nested property
                setLinkedin(data.socialMedia?.linkedin || ''); // Akses nested property
            } else if (res.status === 401 || res.status === 403) {
                handleUnauthorized();
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Gagal memuat profil: Terjadi kesalahan.');
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError('Gagal terhubung ke server untuk memuat profil.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleSave = async () => {
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            handleUnauthorized();
            return;
        }

        // Kumpulkan data yang akan diupdate sesuai dengan schema User
        const updateData = {
            name,
            email,
            bio,
            profilePictureUrl,
            website,
            socialMedia: {
                instagram,
                linkedin
            }
        };

        // Logika perubahan password
        if (oldPassword || newPassword) {
            if (newPassword.length < 6) { // Contoh validasi password minimum length
                alert('Password baru minimal 6 karakter.');
                return;
            }
            updateData.oldPassword = oldPassword;
            updateData.newPassword = newPassword;
        } else if (oldPassword && !newPassword) {
            alert('Anda harus mengisi password baru jika mengisi password lama.');
            return;
        } else if (!oldPassword && newPassword) {
            alert('Anda harus mengisi password lama untuk mengubah password.');
            return;
        }

        try {
            const res = await fetch(`smart-news-backend.vercel.app/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });

            if (res.ok) {
                const data = await res.json();
                // Perbarui localStorage dengan data terbaru dari backend (opsional, tapi disarankan)
                localStorage.setItem('name', data.user.name);
                localStorage.setItem('email', data.user.email);
                // Jika ada field lain yang mungkin diakses langsung dari localStorage, perbarui juga
                // Misalnya, jika Anda menyimpan seluruh objek user di localStorage:
                // localStorage.setItem('user', JSON.stringify(data.user));

                alert('Profil berhasil diperbarui!');
                setIsEditing(false);
                setOldPassword('');
                setNewPassword('');
                fetchUserProfile(); // Muat ulang untuk memastikan UI sinkron
            } else if (res.status === 401 || res.status === 403) {
                handleUnauthorized();
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Gagal mengupdate profil: Terjadi kesalahan.');
                alert('Gagal mengupdate profil: ' + (errorData.error || 'Terjadi kesalahan.'));
            }
        } catch (err) {
            console.error('Error saat mengupdate profil:', err);
            setError('Terjadi kesalahan server saat mengupdate profil.');
            alert('Terjadi kesalahan server saat mengupdate profil.');
        }
    };

    const handleDeleteAccount = async () => {
        setError(null);
        const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.');
        if (confirmDelete) {
            const token = localStorage.getItem('token');
            if (!token) {
                handleUnauthorized();
                return;
            }

            try {
                const res = await fetch(`smart-news-backend.vercel.app/api/api/users/profile`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (res.ok) {
                    localStorage.clear(); // Hapus semua data user dari localStorage
                    alert('Akun berhasil dihapus. Anda akan diarahkan ke halaman utama.');
                    navigate('/home');
                } else if (res.status === 401 || res.status === 403) {
                    handleUnauthorized();
                } else {
                    const errorData = await res.json();
                    setError(errorData.error || 'Gagal menghapus akun: Terjadi kesalahan.');
                    alert('Gagal menghapus akun: ' + (errorData.error || 'Terjadi kesalahan.'));
                }
            } catch (err) {
                console.error('Error saat menghapus akun:', err);
                setError('Terjadi kesalahan server saat menghapus akun.');
                alert('Terjadi kesalahan server saat menghapus akun.');
            }
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="p-6 min-h-screen bg-gray-100 text-gray-800 flex justify-center items-center">
                    <p>Memuat profil...</p>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <main className="p-6 min-h-screen bg-gray-100 text-gray-800 flex justify-center items-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                        {error.includes('login kembali') && (
                            <button onClick={() => navigate('/login')} className="ml-2 underline">Login</button>
                        )}
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="p-6 min-h-screen bg-gray-100 text-gray-800">
                <h2 className="text-2xl font-bold mb-6">Profil Saya</h2>
                <div className="bg-white p-6 rounded shadow space-y-6">
                    {isEditing ? (
                        <>
                            <div>
                                <label className="block mb-1 text-sm">Nama</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Bio</label>
                                <textarea
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[80px]"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength="500" // Sesuai schema
                                    placeholder="Tulis bio singkat Anda (maks 500 karakter)"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">URL Gambar Profil</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={profilePictureUrl}
                                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                                    placeholder="https://example.com/your-profile-pic.jpg"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Website</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://your-website.com"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <div className="w-1/2">
                                    <label className="block mb-1 text-sm">Instagram</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="username_ig"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block mb-1 text-sm">LinkedIn</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        placeholder="linkedin.com/in/username"
                                    />
                                </div>
                            </div>
                            {/* Input untuk perubahan password */}
                            <div className="mt-4">
                                <label className="block mb-1 text-sm">Password Lama (kosongkan jika tidak ingin mengubah)</label>
                                <input
                                    type="password"
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Isi password lama Anda"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Password Baru (kosongkan jika tidak ingin mengubah)</label>
                                <input
                                    type="password"
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Isi password baru Anda (minimal 6 karakter)"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
                                >
                                    Simpan Perubahan
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setOldPassword('');
                                        setNewPassword('');
                                        fetchUserProfile(); // Muat ulang profil untuk memastikan data asli kembali
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white font-semibold"
                                >
                                    Batal
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p><strong>Nama:</strong> {name}</p>
                            <p><strong>Email:</strong> {email}</p>
                            {bio && <p><strong>Bio:</strong> {bio}</p>}
                            {profilePictureUrl && <p><strong>Gambar Profil:</strong> <img src={profilePictureUrl} alt="Profil" className="w-24 h-24 rounded-full object-cover mt-2" /></p>}
                            {website && <p><strong>Website:</strong> <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{website}</a></p>}
                            {(instagram || linkedin) && (
                                <p><strong>Media Sosial:</strong>
                                    {instagram && <span className="ml-2">Instagram: <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{instagram}</a></span>}
                                    {linkedin && <span className="ml-2">LinkedIn: <a href={`https://linkedin.com/in/${linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{linkedin}</a></span>}
                                </p>
                            )}
                            <div className="flex space-x-4 mt-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
                                >
                                    Edit Profil
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
                                >
                                    Hapus Akun
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
};

export default Profile;