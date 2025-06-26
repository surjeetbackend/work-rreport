import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SupervisorDashboard() {
  const [works, setWorks] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});

  const fetchApprovedWorks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/supervisor/approved-works', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      setWorks(res.data);

      const initialFormData = {};
      res.data.forEach((work) => {
        initialFormData[work._id] = {
          estimatedTime: '',
          laborRequired: '',
          startPhoto: null,
          completionPhoto: null,
          materialRequest: '',
        };
      });
      setFormData(initialFormData);
    } catch {
      setError('Error fetching approved works');
    }
  };

  useEffect(() => {
    fetchApprovedWorks();
  }, []);

  const handleInput = (workId, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [workId]: { ...prev[workId], [key]: value },
    }));
  };

  const handleStart = async (workId) => {
    const data = formData[workId];
    const form = new FormData();
    form.append('workId', workId);
    form.append('estimatedTime', data.estimatedTime);
    form.append('laborRequired', data.laborRequired);
    if (data.startPhoto) {
      form.append('startPhoto', data.startPhoto);
    }

    try {
      await axios.post('http://localhost:5000/api/supervisor/start-work', form, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchApprovedWorks();
    } catch {
      setError('Failed to start work');
    }
  };

  const handleComplete = async (workId) => {
    const data = formData[workId];
    const form = new FormData();
    form.append('workId', workId);
    if (data.completionPhoto) {
      form.append('completionPhoto', data.completionPhoto);
    }

    try {
      await axios.post('http://localhost:5000/api/supervisor/complete-work', form, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchApprovedWorks();
    } catch {
      setError('Failed to complete work');
    }
  };

  const handleMaterialRequest = async (workId) => {
    const data = formData[workId];
    try {
      await axios.post(
        'http://localhost:5000/api/supervisor/material-request',
        {
          workId,
          materialRequest: data.materialRequest,
        },
        {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }
      );
      fetchApprovedWorks();
    } catch {
      setError('Material request failed');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Assigned: '#f0ad4e',
      'In Progress': '#5bc0de',
      Completed: '#5cb85c',
    };
    return (
      <span
        style={{
          padding: '2px 6px',
          backgroundColor: colors[status] || '#777',
          color: 'white',
          borderRadius: '5px',
          fontSize: '12px',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div>
      <h2>Supervisor Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Token</th>
            <th>Client</th>
            <th>Description</th>
            <th>Status</th>
            <th>Start Work</th>
            <th>Complete</th>
            <th>Materials</th>
          </tr>
        </thead>
        <tbody>
          {works.map((work) => (
            <tr key={work._id}>
              <td>{work.token_no}</td>
              <td>{work.client_id?.name}</td>
              <td>{work.description}</td>
              <td>{getStatusBadge(work.status)}</td>

              {/* Start Work */}
              <td>
                <div>
                  <p><strong>Estimated:</strong> {work.estimatedTime}</p>
                  <p><strong>Labor:</strong> {work.laborRequired}</p>
                  {work.startPhoto && (
                    <img src={work.startPhoto} alt="Start" width="80" />
                  )}
                  {work.status === 'Assigned' && (
                    <>
                      <input
                        placeholder="Estimated Time"
                        value={formData[work._id]?.estimatedTime}
                        onChange={(e) => handleInput(work._id, 'estimatedTime', e.target.value)}
                      />
                      <input
                        placeholder="Labour Needed"
                        value={formData[work._id]?.laborRequired}
                        onChange={(e) => handleInput(work._id, 'laborRequired', e.target.value)}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleInput(work._id, 'startPhoto', e.target.files[0])
                        }
                      />
                      <button onClick={() => handleStart(work._id)}>Start</button>
                    </>
                  )}
                </div>
              </td>

              {/* Complete Work */}
              <td>
                <div>
                  {work.completionPhoto && (
                    <img src={work.completionPhoto} alt="Complete" width="80" />
                  )}
                  {work.status === 'In Progress' && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleInput(work._id, 'completionPhoto', e.target.files[0])
                        }
                      />
                      <button onClick={() => handleComplete(work._id)}>Complete</button>
                    </>
                  )}
                </div>
              </td>

              {/* Material Request */}
              <td>
                <p><strong>Requested:</strong> {work.materialRequest || 'None'}</p>
                <p><strong>Status:</strong> {work.materialApproved ? '✅ Approved' : 'Pending'}</p>
                {work.status === 'In Progress' && (
                  <>
                    <input
                      placeholder="Material Request"
                      value={formData[work._id]?.materialRequest || ''}
                      onChange={(e) =>
                        handleInput(work._id, 'materialRequest', e.target.value)
                      }
                    />
                    <button onClick={() => handleMaterialRequest(work._id)}>Request</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
