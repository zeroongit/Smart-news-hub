import { useState } from "react"
import Navbar from "../components/Navbar";

const Job = () => {
    const[jobs, setJobs] = useState([
        {id: 1, title: 'Update Konten Berita', status: 'Pending'},
        {id: 2, title: 'Moderasi Komentar', status: 'On Progress'},
        {id: 3, title: 'Analisa Traffic Web', status: 'Done'}
    ]);

    const updateStatus = (id, newsStatus) => {
        const updated = jobs.map(job => job.id === id ? { ...job, status: newsStatus} : job);
        setJobs(updated);
    };

    return (
        <>
            <Navbar />
            <main className="p-6 min-h-screen bg-gray-100 text-gray-800">
                <h2 className="text-2xl font-bold mv-6">Manajemen Tugas (Job)</h2>
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{job.title}</h3>
                                <p className="text-sm text-gray-500">Status: <strong>{job.status}</strong></p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => updateStatus(job.id, 'Pending')} className="bg-yelow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm text-white">
                                    Pending
                                </button>
                                <button onClick={() => updateStatus(job.id, 'Done')} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white">
                                    Done
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
};

export default Job;