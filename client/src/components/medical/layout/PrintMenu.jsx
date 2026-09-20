import { useEffect, useRef, useState } from 'react';
import { useMedical } from '../../../context/MedicalContext.jsx';
import * as api from '../../../services/medical/medicalService.js';

const ITEMS = [
  { header: 'PHIẾU' },
  'Tờ điều trị', 'Đơn thuốc', 'Phiếu hẹn khám', 'Phiếu PT-TT (In gộp)', 'Phiếu thực hiện PTTT (In gộp)',
  'Phiếu xác nhận tư vấn', 'Phiếu khám chuyên khoa', 'Phiếu cam đoan phẫu thuật, thủ thuật',
  'Bản thỏa thuận chỉnh nha', 'Khai báo Tiền sử Dị ứng', 'Bảng kiểm DV sau sinh',
  { header: 'BÁO CÁO' },
  'In bảng kê', 'Phiếu công khai Dịch vụ KCB', 'Phiếu công khai Thuốc', 'Sổ biên bản hội chẩn',
  'Phiếu công khai VTYT', 'Sổ đẻ',
];

/** Dùng lại ở nút "In" của toolbar và nút "In" trong phiếu điều trị. */
export default function PrintMenu({ label = 'In', className = 'btn' }) {
  const { patient, notify } = useMedical();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const print = async (kind) => {
    setOpen(false);
    if (!patient) return;
    const r = await api.printDoc(patient.id, kind);
    if (r?.url) window.open(r.url, '_blank');
    else { notify(`Đang in: ${kind}`); window.print(); }
  };

  const shown = ITEMS.filter((i) => typeof i !== 'string' || i.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="dropdown" ref={ref}>
      <button className={className} onClick={() => setOpen((o) => !o)} disabled={!patient}>🖶 {label}</button>
      {open && (
        <div className="dropdown__panel dropdown__panel--right">
          <input autoFocus className="input" placeholder="Tìm kiếm..." value={q} onChange={(e) => setQ(e.target.value)} />
          <ul>
            {shown.map((i, k) =>
              typeof i === 'string'
                ? <li key={i}><button onClick={() => print(i)}>{i}</button></li>
                : <li key={k} className="dropdown__header">{i.header}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
