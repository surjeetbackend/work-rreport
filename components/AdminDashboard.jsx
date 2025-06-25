import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [works, setWorks] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState({});
  const [loadingWorks, setLoadingWorks] = useState({});
  const [error, setError] = useState('');

  const fetchWorks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/pending-works', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      setWorks(res.data);
    } catch {
      setError('Error fetching works'); 
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/supervisors', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      setSupervisors(res.data);
    } catch {
      setError('Error fetching supervisors');
    }
  };

  useEffect(() => {
    fetchWorks();
    fetchSupervisors();
  }, []);

  const handleApproveOnly = async (workId) => {
    setError('');
    setLoadingWorks(prev => ({ ...prev, [workId]: true }));
    try {
      await axios.post(
        'http://localhost:5000/api/admin/approve-work',
        { workId },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      fetchWorks();
    } catch {
      setError('Error approving work');
    }
    setLoadingWorks(prev => ({ ...prev, [workId]: false }));
  };

  const handleAssignSupervisor = async (workId) => {
    const supervisorId = selectedSupervisors[workId];
    console.log("Selected Supervisor ID:", supervisorId);
    if (!supervisorId) {
      setError('Please select a supervisor');
      return;
    }

    setError('');
    setLoadingWorks(prev => ({ ...prev, [workId]: true }));
    try {
      await axios.post(
        'http://localhost:5000/api/admin/assign-supervisor',
        { workId, supervisorId },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      fetchWorks();
      setSelectedSupervisors(prev => ({ ...prev, [workId]: '' }));
    } catch {
      setError('Error assigning supervisor');
    }
    setLoadingWorks(prev => ({ ...prev, [workId]: false }));
  };

  return (
    <div>
      <h2>Pending Work Requests</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {works.length === 0 ? (
        <p>No pending work requests</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Token</th>
              <th>Client</th>
              <th>Description</th>
              <th>Approval Status</th>
              <th>Assign Supervisor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work._id}>
                <td>{work.token_no}</td>
                <td>{work.client_id.name} ({work.client_id.email})</td>
                <td>{work.description}</td>
                <td>{work.approvalStatus}</td>
                <td>
                  {work.approvalStatus !== 'Approved' && (
                    <small style={{ color: 'gray', display: 'block' }}>
                      Approve first to enable
                    </small>
                  )}
                  <select
                    value={selectedSupervisors[work._id] || ''}
                    onChange={(e) =>
                      setSelectedSupervisors({ ...selectedSupervisors, [work._id]: e.target.value })
                    }
                    disabled={work.approvalStatus !== 'Approved'}
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map((sup) => (
                      <option key={sup._id} value={sup._id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {work.approvalStatus === 'Pending' ? (
                    <button
                      onClick={() => handleApproveOnly(work._id)}
                      disabled={loadingWorks[work._id]}
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAssignSupervisor(work._id)}
                      disabled={loadingWorks[work._id]}
                    >
                      Assign
                    </button>
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
