import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const StudentFees = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.studentId) return;
      try {
        const { data } = await api.get(`/fees/student/${user.studentId}`);
        setRecords(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user]);

  const latest = records[0];

  const statusText = latest
    ? latest.status === 'Paid'
      ? 'All fees paid.'
      : 'Payment pending.'
    : 'No fee record found.';

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-white">My Fees</h1>
      <p className="text-sm text-slate-400">
        Check your latest fee status and payment history.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm">
        <p className="text-slate-300">
          <span className="font-semibold">Current Status: </span>
          {statusText}
        </p>
        {latest && (
          <p className="text-slate-400 mt-1">
            Last record: Amount {latest.amount} ({latest.status}) on{' '}
            {latest.payment_date
              ? new Date(latest.payment_date).toLocaleDateString()
              : 'N/A'}
          </p>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="text-left px-4 py-2">Amount</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t border-slate-800">
                <td className="px-4 py-2 text-slate-100">{r.amount}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      r.status === 'Paid'
                        ? 'px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs'
                        : 'px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs'
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {r.payment_date
                    ? new Date(r.payment_date).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td
                  colSpan="3"
                  className="text-center p-4 text-slate-500 text-sm"
                >
                  No fee records found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFees;
