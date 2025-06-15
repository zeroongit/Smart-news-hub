import Navbar from '../components/Navbar.jsx'

const Dashboard = () => {
    const name = localStorage.getItem('usename') || 'Admin'

    return (
        <>
            <Navbar />
            <main className='p-6 min-h-sscreen bg-gray-100 text-fray-800'>
                <h2 className='text-2xl font-bold mb-6'>Dashboard</h2>
                <div className='bg-white p-6 rounded shadow'>
                    <p className='text-lg'>Halo, <strong>{username}</strong> 👋</p>
                    <p className='mt-2'>Selamat datang , Di sini Anda bisa mengelola artikel berita.</p>
                </div>
            </main>
        </>
    );
};

export default Dashboard;