import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'teacher',
    password: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/create-user', form);
      toast.success('User registered');
      setForm({ name: '', email: '', role: 'teacher', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-white">Create User</h1>

      <form className="bg-slate-900 p-6 rounded-xl space-y-3" onSubmit={handleSubmit}>
        
        <input
          name="name"
          value={form.name}
          className="w-full p-2 rounded bg-slate-800"
          placeholder="Name"
          onChange={handleChange}
        />

        <input
          name="email"
          value={form.email}
          className="w-full p-2 rounded bg-slate-800"
          placeholder="Email"
          onChange={handleChange}
        />

        <select
          name="role"
          className="w-full p-2 rounded bg-slate-800"
          value={form.role}
          onChange={handleChange}
        >
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>

        <input
          name="password"
          type="password"
          value={form.password}
          className="w-full p-2 rounded bg-slate-800"
          placeholder="Password"
          onChange={handleChange}
        />

        <button className="bg-primary-600 hover:bg-primary-500 w-full py-2 rounded-lg text-white">
          Create User
        </button>

      </form>
    </div>
  );
}

export default Users;
