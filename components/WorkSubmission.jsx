import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function WorkSubmission() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('construct');
  const [requirement, setRequirement] = useState('high');
  const [tokenNo, setTokenNo] = useState(null);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/work/submit', {
        description,
        location,
        work_type: workType,
        requirement
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });

      setTokenNo(res.data.token_no);
      setDescription('');
      setLocation('');
      setWorkType('construct');
      setRequirement('high');

      setTimeout(() => {
        navigate('/client-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  if (!user || user.role !== 'client') return <p>Only clients can submit work.</p>;

  return (
    <div>
      <h2>Submit New Work</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Work description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <select value={workType} onChange={e => setWorkType(e.target.value)} required>
          <option value="construct">Construct</option>
          <option value="repair">Repair</option>
          <option value="build">Build</option>
        </select>
        <select value={requirement} onChange={e => setRequirement(e.target.value)} required>
          <option value="high">High (Immediate)</option>
          <option value="medium">Medium</option>
          <option value="light">Light</option>
        </select>
        <button type="submit">Submit Work</button>
      </form>
      {tokenNo && <p>Work submitted successfully! Your token number is: <b>{tokenNo}</b></p>}
      {error && <p>{error}</p>}
    </div>
  );
}
