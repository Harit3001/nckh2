import { useEffect, useState } from 'react';
import { useMedical } from '../../../context/MedicalContext.jsx';
import useAsync from '../../../hooks/useAsync.js';
import * as api from '../../../services/medical/medicalService.js';
import DataTable from '../common/DataTable.jsx';
import { buildUsage, fmtDateTime } from '../../../utils/format.js';

const EMPTY = { drugId: '', s: '', t: '', c: '', n: '', soNgay: 1, soLuong: '', timing: 'Sau ăn', note: '' };

/** Kê thuốc - vật tư cho một phiếu điều trị. */
export default function PhieuDrugPanel({ phieu, disabled, onChanged }) {
  const { patient, notify } = useMedical();
  const [f, setF] = useState(EMPTY);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(null);
  const { data: catalog } = useAsync(() => api.listDrugCatalog(q), [q], []);
  useEffect(() => setF(EMPTY), [phieu?.id]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const perDay = ['s', 't', 'c', 'n'].reduce((a, k) => a + Number(f[k] || 0), 0);
  const suggested = perDay * Number(f.soNgay || 0);
  const noPhieu = !phieu || disabled;

  const save = async () => {
    const drug = catalog.find((d) => d.id === f.drugId);
    if (!drug) return notify('Chọn tên thuốc trước khi lưu');
    const soLuong = Number(f.soLuong || suggested);
    if (!soLuong) return notify('Nhập số lượng hoặc liều S/T/C/T');
    const stct = { s: +f.s || 0, t: +f.t || 0, c: +f.c || 0, n: +f.n || 0 };
    await api.addPhieuDrug(patient.id, phieu.id, {
      ...drug, soNgay: +f.soNgay, soLuong, stct, timing: f.timing,
      cachDung: f.note || buildUsage(stct, f.timing),
    });
    setF(EMPTY); onChanged(); notify('Đã thêm thuốc vào phiếu');
  };
  const remove = async (row) => { await api.removePhieuDrug(patient.id, phieu.id, row.rowId); onChanged(); };
  const move = async (row, dir) => { await api.movePhieuDrug(patient.id, phieu.id, row.rowId, dir); onChanged(); };

  return (
    <div className={`drug-panel ${noPhieu ? 'is-disabled' : ''}`}>
      <div className="drug-form">
        <label>Kho thuốc:<select className="input" disabled><option>Kho Thuốc Gây nghiện-Hướng thần</option></select></label>
        <label>Hoạt chất:<input className="input" placeholder="Tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)} disabled={noPhieu} /></label>
        <label className="grow">Tên thuốc:
          <select className="input" value={f.drugId} onChange={set('drugId')} disabled={noPhieu}>
            <option value="" />
            {catalog.map((d) => <option key={d.id} value={d.id}>{d.ten} {d.hamLuong && `(${d.hamLuong})`}</option>)}
          </select>
        </label>
        <div className="stct">
          <span>S/T/C/T:</span>
          {['s', 't', 'c', 'n'].map((k) => <input key={k} className="input input--xs" inputMode="numeric" value={f[k]} onChange={set(k)} disabled={noPhieu} />)}
        </div>
        <label><span><b className="req">*</b>Số ngày:</span><input className="input input--sm" type="number" min="1" value={f.soNgay} onChange={set('soNgay')} disabled={noPhieu} /></label>
        <label><span><b className="req">*</b>Số lượng:</span><input className="input input--sm" type="number" min="0" placeholder={suggested || ''} value={f.soLuong} onChange={set('soLuong')} disabled={noPhieu} /></label>
        <label>Cách dùng:
          <select className="input" value={f.timing} onChange={set('timing')} disabled={noPhieu}>
            {['Trước ăn', 'Sau ăn', 'Trong bữa ăn', 'Khi cần'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <input className="input grow" placeholder="Ghi chú cách dùng (bỏ trống để tự tạo)" value={f.note} onChange={set('note')} disabled={noPhieu} />
        <button className="btn btn--primary" onClick={save} disabled={noPhieu}>💾 Lưu</button>
      </div>

      <DataTable
        rowKey="rowId"
        dense
        selectedKey={picked}
        onRowClick={(r) => setPicked(r.rowId)}
        rows={phieu?.drugs ?? []}
        columns={[
          { key: 'del', title: '🗑', width: 40, render: (r) => <button className="icon-btn icon-btn--danger" disabled={noPhieu} onClick={() => remove(r)}>🗑</button> },
          { key: 'up', title: '…', width: 34, render: (r) => <button className="icon-btn" disabled={noPhieu} onClick={() => move(r, -1)}>↑</button> },
          { key: 'down', title: '…', width: 34, render: (r) => <button className="icon-btn" disabled={noPhieu} onClick={() => move(r, 1)}>↓</button> },
          { key: 'ngayTH', title: 'Ngày TH Y lệnh', width: 130, render: (r) => fmtDateTime(r.ngayTH) },
          { key: 'hoatChat', title: 'Hoạt chất', width: 150 },
          { key: 'ten', title: 'Tên thuốc - vật tư', render: (r) => <><span className={`tag tag--${r.nguon === 'VP' ? 'vp' : 'bh'}`}>{r.nguon}</span> <b>{r.ten}</b></> },
          { key: 'dvt', title: 'ĐVT', width: 60 },
          { key: 'hamLuong', title: 'Hàm lượng', width: 130 },
          { key: 'duong', title: 'Đường dùng', width: 90 },
          { key: 'cachDung', title: 'Cách dùng' },
        ]}
      />
    </div>
  );
}
