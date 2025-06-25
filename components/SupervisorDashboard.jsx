import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SupervisorDashboard() {
  const [works, setWorks] = useState([]);
  const [error, setError] = useState('');

  const fetchApprovedWorks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/supervisor/approved-works', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setWorks(res.data);
    } catch  {
      setError('Error fetching approved works');
    }
  };

  const handleStart = async (workId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/supervisor/start-work',
        { workId },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      fetchApprovedWorks();
    } catch {
      setError('Failed to start work');
    }
  };

  const handleComplete = async (workId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/supervisor/complete-work',
        { workId },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      fetchApprovedWorks();
    } catch {
      setError('Failed to complete work');
    }
  };

  useEffect(() => {
    fetchApprovedWorks();
  }, []);

  return (
    <div>
      <h2>Supervisor Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {works.length === 0 ? (
        <p>No approved works to display</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Token</th>
              <th>Client</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work._id}>
                <td>{work.token_no}</td>
                <td>{work.client_id.name} ({work.client_id.email})</td>
                <td>{work.description}</td>
                <td>{work.status}</td>
                <td>
                  {work.status === 'Approved' && (
                    <button onClick={() => handleStart(work._id)}>Start Work</button>
                  )}
                  {work.status === 'In Progress' && (
                    <button onClick={() => handleComplete(work._id)}>Mark Completed</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
