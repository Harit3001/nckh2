import { useEffect, useState } from 'react';
import { useMedical, STATUSES } from '../../../context/MedicalContext.jsx';
import Field, { Input, Select } from '../common/Field.jsx';
import Tabs from '../common/Tabs.jsx';

const TYPES = [
  { key: 'noitru', label: 'Nội Trú' },
  { key: 'banngay', label: 'Nội Trú Ban Ngày' },
  { key: 'ngoaitru', label: 'Ngoại Trú' },
];

export default function PatientSidebar() {
  const { filters, setFilters, list, selectedId, selectPatient } = useMedical();
  const [draft, setDraft] = useState(filters);
  const [pageSize, setPageSize] = useState(500);
  useEffect(() => setDraft(filters), [filters]);

  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const apply = (patch = {}) => setFilters({ ...draft, ...patch });

  return (
    <aside className="sidebar card">
      <div className="sidebar__filters">
        <Field label="Khoảng ngày">
          <span className="range">
            <input type="date" className="input" value={draft.from} onChange={(e) => set('from')(e.target.value)} />
            <span>→</span>
            <input type="date" className="input" value={draft.to} onChange={(e) => set('to')(e.target.value)} />
          </span>
        </Field>
        <Field label="Phòng"><Select value={draft.room} onChange={set('room')} options={['Phòng điều trị nội trú 807']} /></Field>
        <Field label="Trạng thái">
          <Select value={draft.status} onChange={(v) => apply({ status: v })} options={STATUSES} />
        </Field>
        <Field label="B.sĩ điều trị"><Select value={draft.doctor} onChange={set('doctor')} options={['000001 | BS. Điều trị']} /></Field>
        <Field label="Mã KCB">
          <span className="range">
            <Input value={draft.maKCB} onChange={set('maKCB')} onKeyDown={(e) => e.key === 'Enter' && apply()} />
            <button className="btn btn--primary-outline" onClick={() => apply()}>🔍 Tìm</button>
          </span>
        </Field>
      </div>

      <Tabs
        items={TYPES}
        active={filters.type}
        onChange={(t) => setFilters({ ...filters, type: t })}
        variant="tabs--pill"
      />

      <div className="patient-list">
        <table className="table table--dense">
          <thead><tr><th style={{ width: 36 }}>TT</th><th style={{ width: 34 }} /><th>Họ tên</th></tr></thead>
          <tbody>
            {list.items.slice(0, pageSize).map((p, i) => (
              <tr
                key={p.id}
                className={`patient-row ${p.id === selectedId ? 'is-current' : ''}`}
                onClick={() => selectPatient(p.id)}
              >
                <td className="muted">{i + 1}</td>
                <td>{p.cc && <span className="tag tag--cc">CC</span>}</td>
                <td><span className="tag tag--bh">{p.insurance}</span> <span className="patient-name">{p.name}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.loading && list.items.length === 0 && <div className="empty">Không có bệnh nhân phù hợp bộ lọc</div>}
        {list.loading && <div className="empty">Đang tải…</div>}
      </div>

      <div className="sidebar__pager">
        <span>Tổng : <a>{list.items.length}</a></span>
        <select className="input input--sm" value={pageSize} onChange={(e) => setPageSize(+e.target.value)}>
          {[50, 100, 500].map((n) => <option key={n} value={n}>{n} / Trang</option>)}
        </select>
      </div>
      <div className="sidebar__counts">
        <b className="c-blue">Chờ NV: {list.counts.cho}</b>
        <b className="c-orange">Đang ĐT: {list.counts.dang}</b>
        <b className="c-green">Ra Viện: {list.counts.ra}</b>
      </div>
    </aside>
  );
}
