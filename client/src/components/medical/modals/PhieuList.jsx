import { fmtDateTime } from '../../../utils/format.js';

/** Cột trái của phiếu điều trị: danh sách phiếu + ô tìm kiếm. */
export default function PhieuList({ items, selectedId, isNew, mode, q, onQ, onSelect }) {
  const shown = items.filter((p) => (p.id + p.bacSi + p.khoa).toLowerCase().includes(q.toLowerCase()));
  return (
    <aside className="phieu-list">
      <div className="range">
        <input className="input" placeholder="🔍 Tìm kiếm" value={q} onChange={(e) => onQ(e.target.value)} />
        <select className="input input--sm"><option>Tất cả</option></select>
      </div>
      {isNew && (
        <div className="phieu-item is-new">
          <b>Phiếu điều trị mới</b><span>Chưa lưu</span>
        </div>
      )}
      {shown.map((p) => (
        <button
          key={p.id}
          className={`phieu-item ${!isNew && p.id === selectedId ? (mode === 'edit' ? 'is-new' : 'is-selected') : ''}`}
          onClick={() => onSelect(p.id)}
          disabled={mode !== 'view'}
        >
          <b>{fmtDateTime(p.ngay)}</b>
          <span>|| Bác sĩ: {p.bacSi.split('|').pop().trim()}</span>
          <span>|| N.Lập: {p.nguoiLap}</span>
          <span>{p.id}</span>
          <span>{p.khoa}</span>
        </button>
      ))}
    </aside>
  );
}
