import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/work/my-works', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setWorks(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch works');
        setLoading(false);
      }
    };

    if (user?.role === 'client') fetchWorks();
  }, [user]);

  if (user?.role !== 'client') return <p>Only clients can view this page.</p>;

  return (
    <div>
      <h2>My Submitted Works</h2>
      {loading ? <p>Loading...</p> : (
        <ul>
          {works.map(work => (
            <li key={work._id} style={{ marginBottom: '20px' }}>
              <p><strong>Token:</strong> {work.token_no}</p>
              <p><strong>Description:</strong> {work.description}</p>
              <p><strong>Location:</strong> {work.location}</p>
              <p><strong>Type:</strong> {work.work_type}</p>
              <p><strong>Requirement:</strong> {work.requirement}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ color: getStatusColor(work.status) }}>{work.status}</span>
              </p>
              <p>
                <strong>Assigned Supervisor:</strong>{' '}
                {work.assigned_to?.name || 'Not Assigned'}
              </p>
              <hr />
            </li>
          ))}
        </ul>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'Submitted': return 'gray';
    case 'Approved': return 'blue';
    case 'Assigned': return 'orange';
    case 'In Progress': return 'purple';
    case 'Completed': return 'green';
    default: return 'black';
  }
}
