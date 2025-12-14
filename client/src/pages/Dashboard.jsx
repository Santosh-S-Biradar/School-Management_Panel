import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const StatCard = ({ label, value }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
    <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="mt-2 text-2xl font-bold text-slate-100">{value}</span>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    todayPresent: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, attendanceRes] = await Promise.all([
          api.get('/students'),
          api.get('/teachers'),
          api.get('/classes'),
          api.get('/attendance/summary')
        ]);
        const students = studentsRes.data || [];
        const teachers = teachersRes.data || [];
        const classes = classesRes.data || [];
        const attendance = attendanceRes.data || [];

        const todayPresent = attendance.reduce(
          (sum, cls) => sum + (cls.present_count || 0),
          0
        );

        setStats({
          students: students.length,
          teachers: teachers.length,
          classes: classes.length,
          todayPresent
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Admin Dashboard</h1>
        <p className="text-sm text-slate-400">
          Overview of your school in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Students" value={stats.students} />
        <StatCard label="Total Teachers" value={stats.teachers} />
        <StatCard label="Total Classes" value={stats.classes} />
        <StatCard label="Present Today" value={`${stats.todayPresent} / ${stats.students}`}
/>

      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          Quick Tips
        </h2>
        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
          <li>Use the Attendance page to mark daily presence/absence class-wise.</li>
          <li>Update Fees for each class so students can see dues and payments.</li>
          <li>Post important updates in Announcements so everyone stays informed.</li>
          <li>Use Messages to contact teachers, students or parents directly.</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
