const DataTable = ({ columns, rows }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-left text-ink-500">
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 font-medium">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="border-t border-slate-200">
            {row.map((cell, cellIdx) => (
              <td key={cellIdx} className="px-4 py-3 text-ink-700">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
