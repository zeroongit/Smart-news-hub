import { useState } from "react"

const Profile = () => {
    const [name, setName] = useState(localStorage.getItem('name') || '');
    const [email, setEmail] = useState(localStorage.getItem('email') || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        localStorage.setItem('name, name');
        localStorage.setItem('email', email);
        alert('Profil berhasil diperbarui!');
        setIsEditing(false);
    };

    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm('Apakah kamu yakin ingin menghapuus akunmu?');
        if (confirmDelete) {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            localStorage.removeItem('email');
            alert('Akun berhasil Dihapus.');
            Navigate('/home');
        }
    };

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
                                <input type="text" className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" value={name} onChange={(e) => setName(e.target.value)}/>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Email</label>
                                <input type="email" className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="flex space-x-4">
                                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold">Simpan</button>
                                <button onClick={() => setIsEditing(false)} className="bg-gray-500 hover-:bg-gray-600 px-4 py-2 rounded text-white font-semibold">Batal</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p><strong>Nama:</strong>{name}</p>
                            <p><strong>Email:</strong>{email}</p>
                            <div className="flex space-x-4 mt-4">
                                <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold">Edit Profil</button>
                                <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold">Hapus Akun</button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
};

export default Profile;