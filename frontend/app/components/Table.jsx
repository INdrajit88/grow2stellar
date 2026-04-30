export default function Table({ columns, data, emptyMessage = "No data available." }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-ink/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-cloud text-ink/70">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 font-semibold uppercase">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-ink/60">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-cloud/40 transition">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-ink">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
