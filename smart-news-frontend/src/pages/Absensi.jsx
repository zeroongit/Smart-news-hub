import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const Absensi = () => {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAbsen = (tipe) => {
    const waktu = new Date().toLocaleTimeString();
    const data = { tipe, waktu };
    setHistory(prev => [...prev, data]);
    setStatus(`Absen ${tipe} pada ${waktu}`);
  };

  useEffect(() => {
    // Simulasi ambil riwayat absensi (dummy)
    setHistory([
      { tipe: 'Masuk', waktu: '08:00:00' },
      { tipe: 'Keluar', waktu: '17:00:00' },
    ]);
  }, []);

  return (
    <>
      <Navbar />
      <main className="p-6 min-h-screen bg-gray-100 text-gray-800">
        <h2 className="text-2xl font-semibold mb-4">Absensi</h2>
        <div className="space-x-4 mb-6">
          <button
            onClick={() => handleAbsen('Masuk')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Absen Masuk
          </button>
          <button
            onClick={() => handleAbsen('Keluar')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Absen Keluar
          </button>
        </div>
        {status && <p className="mb-4">{status}</p>}

        <h3 className="text-lg font-semibold mb-2">Riwayat Absensi:</h3>
        <ul className="list-disc list-inside">
          {history.map((item, index) => (
            <li key={index}>{item.tipe} pada {item.waktu}</li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default Absensi;
