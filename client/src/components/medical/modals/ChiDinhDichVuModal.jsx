import { useEffect, useMemo, useState } from 'react';
import { useMedical } from '../../../context/MedicalContext.jsx';
import useAsync from '../../../hooks/useAsync.js';
import * as api from '../../../services/medical/medicalService.js';
import Modal from '../common/Modal.jsx';
import DataTable from '../common/DataTable.jsx';
import PatientHeaderInfo from '../patients/PatientHeaderInfo.jsx';
import { fmtDateTime, moneyVN } from '../../../utils/format.js';

const PAGE_SIZE = 10;
const TEMPLATES = [
  { key: 'tk', label: 'Gói thần kinh cơ bản', ids: ['s11', 's12', 's13', 's14', 's15'] },
  { key: 'xn', label: 'Xét nghiệm sinh hóa cơ bản', ids: ['s16', 's17', 's18', 's19', 's20'] },
];

const unitPrice = (s, patient) => (patient.insurance === 'BH' && s.bhyt > 0 ? s.bhyt : s.vienPhi);

export default function ChiDinhDichVuModal() {
  const { patient, order, closeOrder, bump, notify } = useMedical();
  const [phieuId, setPhieuId] = useState(order.phieuId);
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState([]);     // dịch vụ đã chọn
  const [focusId, setFocusId] = useState(null);  // dòng đang chỉnh ở form giữa
  const [dx, setDx] = useState({ icdChinh: patient.icdChinh, chanDoan: patient.chanDoan });
  const [tpl, setTpl] = useState('');

  const { data: phieus } = useAsync(() => api.listPhieu(patient.id), [patient.id], []);
  const { data: catalog, loading } = useAsync(
    () => api.listServiceCatalog({ category, q, page, size: PAGE_SIZE }), [category, q, page], { items: [], total: 0 }
  );
  const { data: all } = useAsync(() => api.listServiceCatalog({ size: 1000 }), [], { items: [] });
  const { data: rooms } = useAsync(() => api.listExecRooms(focusId), [focusId], []);

  useEffect(() => setPage(1), [category, q]);

  const focus = picked.find((x) => x.serviceId === focusId);
  const pages = Math.max(1, Math.ceil(catalog.total / PAGE_SIZE));
  const total = useMemo(() => picked.reduce((a, x) => a + x.qty * x.price * (1 - x.discount / 100), 0), [picked]);

  const toggle = (s) =>
    setPicked((list) =>
      list.some((x) => x.serviceId === s.id)
        ? list.filter((x) => x.serviceId !== s.id)
        : [...list, {
          serviceId: s.id, code: s.code, name: s.name, group: s.group, qty: 1,
          price: unitPrice(s, patient), bhyt: s.bhyt, vienPhi: s.vienPhi, onlyPrice: !!s.onlyPrice,
          discount: 0, place: '', dvcc: false,
        }]
    );
  const patchPicked = (id, patch) => setPicked((l) => l.map((x) => (x.serviceId === id ? { ...x, ...patch } : x)));

  const applyTemplate = (key) => {
    setTpl(key);
    const t = TEMPLATES.find((x) => x.key === key);
    if (!t) return;
    const add = all.items.filter((s) => t.ids.includes(s.id) && !picked.some((x) => x.serviceId === s.id));
    setPicked((l) => [...l, ...add.map((s) => ({
      serviceId: s.id, code: s.code, name: s.name, group: s.group, qty: 1, price: unitPrice(s, patient),
      bhyt: s.bhyt, vienPhi: s.vienPhi, onlyPrice: !!s.onlyPrice, discount: 0, place: '', dvcc: false,
    }))]);
  };

  const save = async () => {
    if (!phieuId) return notify('Chọn phiếu điều trị cho chỉ định');
    if (!picked.length) return notify('Chưa chọn dịch vụ nào');
    await api.saveOrders(patient.id, { phieuId, items: picked });
    notify(`Đã chỉ định ${picked.length} dịch vụ`);
    bump();          // tab CĐHA/XN/… và phiếu điều trị tải lại
    closeOrder();
  };

  const saveDx = async () => { await api.updateDiagnosis(patient.id, dx); bump(); notify('Đã lưu chẩn đoán'); };

  return (
    <Modal title="Chỉ định dịch vụ" onClose={closeOrder} level={2}>
      <div className="modal-toolbar">
        <div className="modal-toolbar__buttons">
          <button className="tool tool--ok" onClick={save}><i>💾</i>Lưu</button>
          <button className="tool" onClick={() => api.printDoc(patient.id, 'Phiếu chỉ định').then(() => window.print())}><i>🖶</i>P. chỉ định</button>
        </div>
        <PatientHeaderInfo compact />
      </div>

      <div className="order-top">
        <div className="order-top__left">
          <label className="field"><span className="field__label">Phiếu điều trị :</span>
            <select className="input" value={phieuId ?? ''} onChange={(e) => setPhieuId(e.target.value)}>
              <option value="" />
              {phieus.map((p) => <option key={p.id} value={p.id}>{fmtDateTime(p.ngay)} | Bác sĩ: {p.bacSi.split('|').pop().trim()} | {p.id}</option>)}
            </select>
          </label>
          <label className="field"><span className="field__label">Chẩn đoán ban đầu :</span>
            <textarea className="input textarea" rows={2} readOnly value={patient.chanDoan} />
          </label>
        </div>
        <div className="order-top__mid">
          <label className="field"><span className="field__label">ICD chính :</span>
            <input className="input w-sm" value={dx.icdChinh} onChange={(e) => setDx({ ...dx, icdChinh: e.target.value })} />
            <input className="input" readOnly value={patient.benhChinh} />
          </label>
          <label className="field"><span className="field__label">Chẩn đoán :</span>
            <textarea className="input textarea" rows={2} value={dx.chanDoan} onChange={(e) => setDx({ ...dx, chanDoan: e.target.value })} />
          </label>
        </div>
        <div className="order-top__right">
          <button className="btn" onClick={() => setDx({ icdChinh: patient.icdChinh, chanDoan: patient.chanDoan })}>Cập Nhật</button>
          <button className="btn" onClick={saveDx}>Lưu CĐ</button>
        </div>
      </div>

      <h4 className="section-title section-title--sm">Thông tin Dịch vụ chỉ định</h4>
      <div className="order-form">
        <div className="range">
          <span>Mẫu CĐ :</span>
          <select className="input" value={tpl} onChange={(e) => applyTemplate(e.target.value)}>
            <option value="" />
            {TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <button className="btn btn--primary-outline" onClick={() => notify('Quản lý mẫu chỉ định: chưa triển khai')}>Cập nhật</button>
          <button className="btn btn--primary" onClick={() => notify('Quản lý mẫu chỉ định: chưa triển khai')}>Thêm mới</button>
        </div>
        <div className="grid grid--edit">
          <label className="field"><span className="field__label">Mã dịch vụ :</span>
            <input className="input" readOnly value={focus?.code ?? ''} />
            <input className="input" readOnly value={focus?.name ?? ''} />
          </label>
          <label className="field"><span className="field__label">Đơn giá :</span>
            <select className="input" disabled={!focus}
              onChange={(e) => focus && patchPicked(focus.serviceId, { price: e.target.value === 'bh' ? focus.bhyt : focus.vienPhi })}>
              <option value="bh">Giá BHYT</option><option value="vp">Giá viện phí</option>
            </select>
            <input className="input" readOnly value={focus ? moneyVN(focus.price) : ''} />
            <span>Nơi thực hiện :</span>
            <select className="input" disabled={!focus} value={focus?.place ?? ''} onChange={(e) => patchPicked(focus.serviceId, { place: e.target.value })}>
              <option value="" />
              {rooms.map((r) => <option key={r.name}>{r.name}</option>)}
            </select>
            <label className="check"><input type="checkbox" disabled={!focus} checked={!!focus?.dvcc} onChange={(e) => patchPicked(focus.serviceId, { dvcc: e.target.checked })} /> DVCC</label>
            <button className="btn btn--primary" disabled={!focus} onClick={() => notify('Đã cập nhật dòng dịch vụ')}>Cập nhật</button>
          </label>
        </div>
      </div>

      <div className="order-main">
        <aside className="order-cats">
          <div className="tab-head">DVKT</div>
          <ul>
            {api.CATEGORIES.map((c) => (
              <li key={c.key}><button className={category === c.key ? 'is-active' : ''} onClick={() => setCategory(c.key)}>{c.label}</button></li>
            ))}
          </ul>
          <table className="table table--dense">
            <thead><tr><th>Tên phòng</th><th>Tổng</th><th>Chờ</th><th>Đang</th></tr></thead>
            <tbody>{rooms.map((r) => <tr key={r.name}><td>{r.name}</td><td>{r.total}</td><td>{r.waiting}</td><td>{r.active}</td></tr>)}</tbody>
          </table>
          {rooms.length === 0 && <div className="empty">No data</div>}
        </aside>

        <div className="order-catalog">
          <input className="input" placeholder="🔍 Tìm dịch vụ theo tên / mã" value={q} onChange={(e) => setQ(e.target.value)} />
          <DataTable
            dense rows={catalog.items} selectedKey={focusId} rowKey="id"
            empty={loading ? 'Đang tải…' : 'Không có dịch vụ'}
            onRowClick={(r) => picked.some((x) => x.serviceId === r.id) && setFocusId(r.id)}
            columns={[
              { key: 'chk', title: '', width: 34, render: (r) => <input type="checkbox" checked={picked.some((x) => x.serviceId === r.id)} onChange={() => toggle(r)} /> },
              { key: 'code', title: 'Mã DV (TT43)', width: 110 },
              { key: 'only', title: 'Chỉ tính giá DV', width: 90, align: 'center', render: (r) => <input type="checkbox" checked={!!r.onlyPrice} disabled readOnly /> },
              { key: 'loaiPttt', title: 'Loại PTTT', width: 110 },
              { key: 'name', title: 'Tên dịch vụ' },
              { key: 'bhyt', title: 'Giá BHYT', width: 100, align: 'right', render: (r) => moneyVN(r.bhyt) },
              { key: 'vp', title: 'Giá viện phí', width: 110, align: 'right', render: (r) => moneyVN(r.vienPhi) },
              { key: 'cl', title: 'Chênh lệch', width: 100, align: 'right', render: (r) => moneyVN(r.onlyPrice ? 0 : Math.max(r.vienPhi - r.bhyt, 0)) },
            ]}
          />
          <div className="pager">
            <button className="btn btn--sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
            <span>Trang {page} / {pages} — {catalog.total} dịch vụ</span>
            <button className="btn btn--sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>›</button>
          </div>
        </div>
      </div>

      <h4 className="section-title section-title--sm">Dịch vụ đã chọn <span className="muted">— tổng {moneyVN(total)}</span></h4>
      <DataTable
        dense rowKey="serviceId" rows={picked} selectedKey={focusId} onRowClick={(r) => setFocusId(r.serviceId)}
        empty="Tích chọn dịch vụ ở bảng phía trên"
        columns={[
          { key: 'del', title: 'Delete', width: 60, render: (r) => <button className="icon-btn icon-btn--danger" onClick={(e) => { e.stopPropagation(); setPicked((l) => l.filter((x) => x.serviceId !== r.serviceId)); }}>🗑</button> },
          { key: 'dvcc', title: 'DVCC', width: 56, align: 'center', render: (r) => <input type="checkbox" checked={r.dvcc} disabled readOnly /> },
          { key: 'code', title: 'Mã DV(TT43)', width: 120 },
          { key: 'name', title: 'Tên dịch vụ' },
          { key: 'place', title: 'Vị trí TH', width: 170 },
          { key: 'qty', title: 'Số Lượng', width: 80, render: (r) => <input className="input input--xs" type="number" min="1" value={r.qty} onClick={(e) => e.stopPropagation()} onChange={(e) => patchPicked(r.serviceId, { qty: Math.max(1, +e.target.value || 1) })} /> },
          { key: 'price', title: 'Đơn giá', width: 100, align: 'right', render: (r) => moneyVN(r.price) },
          { key: 'discount', title: 'Chiết khấu', width: 80, render: (r) => <input className="input input--xs" type="number" min="0" max="100" value={r.discount} onClick={(e) => e.stopPropagation()} onChange={(e) => patchPicked(r.serviceId, { discount: Math.min(100, +e.target.value || 0) })} /> },
          { key: 'sum', title: 'Thành tiền', width: 110, align: 'right', render: (r) => moneyVN(r.qty * r.price * (1 - r.discount / 100)) },
          { key: 'diff', title: 'Thu chênh', width: 100, align: 'right', render: (r) => moneyVN(r.onlyPrice ? 0 : Math.max(r.vienPhi - r.bhyt, 0) * r.qty) },
        ]}
      />
    </Modal>
  );
}
