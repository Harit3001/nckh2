import { useMemo, useState } from 'react';
import { useMedical } from '../../../context/MedicalContext.jsx';
import useAsync from '../../../hooks/useAsync.js';
import * as api from '../../../services/medical/medicalService.js';
import DataTable from '../common/DataTable.jsx';
import { fmtDateTime, moneyVN } from '../../../utils/format.js';

/** Dùng cho: Xét nghiệm / CĐHA-TDCN / Phẫu thuật-Thủ thuật / Dịch vụ khác. */
export default function OrdersTab({ group }) {
  const { patient, version, openPhieu, notify } = useMedical();
  const [phieuId, setPhieuId] = useState(null);
  const [q, setQ] = useState('');
  const { data: orders, loading } = useAsync(() => api.listOrders(patient.id, { group }), [patient.id, group, version], []);

  const phieus = useMemo(() => {
    const m = new Map();
    orders.forEach((o) => m.set(o.phieuId, o));
    return [...m.values()];
  }, [orders]);

  const rows = orders.filter(
    (o) => (!phieuId || o.phieuId === phieuId) && (o.name + o.code).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="orders">
      <div className="orders__list">
        <DataTable
          rowKey="rowId"
          rows={rows}
          empty={loading ? 'Đang tải…' : 'Chưa có chỉ định. Mở phiếu điều trị → Dịch vụ để chỉ định.'}
          columns={[
            { key: 'st', title: 'TT', width: 40, align: 'center', render: (r) => <span className={`dot dot--${r.status === 'done' ? 'ok' : 'wait'}`} title={r.status} /> },
            { key: 'code', title: 'Mã dịch vụ', width: 120 },
            { key: 'name', title: 'Tên dịch vụ', render: (r) => <><span className="tag tag--bh">BH</span> {r.name}</> },
            { key: 'note', title: 'Ghi chú', width: 100 },
            { key: 'qty', title: 'SL', width: 50, align: 'center' },
            { key: 'price', title: 'Đơn giá', width: 110, align: 'right', render: (r) => moneyVN(r.price) },
          ]}
        />
        <div className="actions actions--between">
          <button className="btn" onClick={() => setPhieuId(null)}>Xem tất cả</button>
          <button className="btn" onClick={async () => { await api.printDoc(patient.id, 'In gộp phiếu chỉ định'); notify('Đã gửi lệnh in gộp phiếu chỉ định'); }}>
            🖶 In Gộp Phiếu chỉ định
          </button>
        </div>
      </div>

      <aside className="orders__side">
        <div className="range">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm dịch vụ…" />
          <button className="btn btn--primary" onClick={openPhieu} title="Thêm chỉ định qua phiếu điều trị">＋</button>
        </div>
        {phieus.map((o) => (
          <button key={o.phieuId} className={`phieu-card ${phieuId === o.phieuId ? 'is-active' : ''}`} onClick={() => setPhieuId(o.phieuId)}>
            <b>{o.phieuId}</b>
            <span>{fmtDateTime(o.phieuAt)}</span>
            <span>|| B.Sĩ: {o.bacSi}</span>
            <span>{o.khoa}</span>
          </button>
        ))}
      </aside>
    </div>
  );
}
