import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [works, setWorks] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState({});
  const [loadingWorks, setLoadingWorks] = useState({});
  const [error, setError] = useState('');

  // Fetch all works
  const fetchWorks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/all-works', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      setWorks(res.data);
    } catch {
      setError('Error fetching works');
    }
  };

  // Fetch all supervisors
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

  // Approve work only
  const handleApproveOnly = async (workId) => {
    setError('');
    setLoadingWorks((prev) => ({ ...prev, [workId]: true }));
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
    setLoadingWorks((prev) => ({ ...prev, [workId]: false }));
  };

  // Assign supervisor
  const handleAssignSupervisor = async (workId) => {
    const supervisorId = selectedSupervisors[workId];
    if (!supervisorId) {
      setError('Please select a supervisor');
      return;
    }

    setError('');
    setLoadingWorks((prev) => ({ ...prev, [workId]: true }));
    try {
      await axios.post(
        'http://localhost:5000/api/admin/assign-supervisor',
        { workId, supervisorId },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      fetchWorks();
      setSelectedSupervisors((prev) => ({ ...prev, [workId]: '' }));
    } catch {
      setError('Error assigning supervisor');
    }
    setLoadingWorks((prev) => ({ ...prev, [workId]: false }));
  };

  // ✅ Approve material request
  const handleApproveMaterial = async (workId) => {
    setError('');
    setLoadingWorks((prev) => ({ ...prev, [workId]: true }));
    try {
      await axios.post(
        'http://localhost:5000/api/admin/approve-material',
        { workId },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      fetchWorks();
    } catch {
      setError('Error approving material request');
    }
    setLoadingWorks((prev) => ({ ...prev, [workId]: false }));
  };

  return (
    <div>
      <h2>All Work Requests</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {works.length === 0 ? (
        <p>No work requests available</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Token</th>
              <th>Client</th>
              <th>Description</th>
              <th>Approval Status</th>
              <th>Work Status</th>
              <th>Material Request</th>
              <th>Assign Supervisor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => {
              const isAssigned = !!work.assigned_to;

              return (
                <tr key={work._id}>
                  <td>{work.token_no}</td>
                  <td>{work.client_id?.name} ({work.client_id?.email})</td>
                  <td>{work.description}</td>
                  <td>{work.approvalStatus}</td>
                  <td>{work.status}</td>

                  <td>
                    {work.materialRequest ? (
                      <div>
                        <p>{work.materialRequest}</p>
                        {work.materialApproved ? (
                          <p style={{ color: 'green' }}>✅ Approved</p>
                        ) : (
                          <button
                            onClick={() => handleApproveMaterial(work._id)}
                            disabled={loadingWorks[work._id]}
                          >
                            Approve Material
                          </button>
                        )}
                      </div>
                    ) : '—'}
                  </td>

                  <td>
                    <select
                      value={
                        isAssigned
                          ? work.assigned_to._id
                          : selectedSupervisors[work._id] || ''
                      }
                      onChange={(e) =>
                        setSelectedSupervisors({
                          ...selectedSupervisors,
                          [work._id]: e.target.value,
                        })
                      }
                      disabled={isAssigned || work.approvalStatus !== 'Approved'}
                    >
                      <option value="">Select Supervisor</option>
                      {supervisors.map((sup) => (
                        <option key={sup._id} value={sup._id}>
                          {sup.name}
                        </option>
                      ))}
                    </select>
                    {isAssigned && (
                      <div style={{ color: 'green', fontSize: '0.9em' }}>
                        Assigned to: {work.assigned_to.name}
                      </div>
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() => handleApproveOnly(work._id)}
                      disabled={loadingWorks[work._id] || work.approvalStatus !== 'Pending'}
                    >
                      Approve
                    </button>
                    &nbsp;
                    <button
                      onClick={() => handleAssignSupervisor(work._id)}
                      disabled={
                        loadingWorks[work._id] ||
                        work.approvalStatus !== 'Approved' ||
                        isAssigned
                      }
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
