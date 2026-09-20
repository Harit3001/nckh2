/**
 * columns: [{ key, title, width, align, render(row, index) }]
 */
export default function DataTable({ columns, rows, rowKey = 'id', selectedKey, onRowClick, empty = 'No data', dense }) {
  return (
    <div className="table-wrap">
      <table className={`table ${dense ? 'table--dense' : ''}`}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key} style={{ width: c.width, textAlign: c.align }}>{c.title}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r[rowKey] ?? i}
              className={selectedKey != null && r[rowKey] === selectedKey ? 'is-selected' : ''}
              onClick={() => onRowClick?.(r)}
            >
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align }}>{c.render ? c.render(r, i) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty">{empty}</div>}
    </div>
  );
}
