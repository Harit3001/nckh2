/**
 * Trạng thái dùng chung của phân hệ Quản lý Bệnh án Nội trú (Medical Records).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/medical/medicalService.js';
import { toInputDate } from '../utils/format.js';

const Ctx = createContext(null);
export const useMedical = () => useContext(Ctx);
export const useHis = useMedical; // Backward compatible alias

export const STATUSES = [
  'Tất cả bệnh nhân', 'Chờ nhập viện', 'Đang điều trị', 'Đã chuyển khoa',
  'Đã ra viện', 'Đã chuyển viện', 'Tử vong', 'B.nhân BHYT',
];

const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

export function MedicalProvider({ children }) {
  const [filters, setFilters] = useState({
    from: toInputDate(daysAgo(7)), to: toInputDate(new Date()),
    room: '', status: 'Đang điều trị', doctor: '', maKCB: '', type: 'noitru',
  });
  const [list, setList] = useState({ items: [], counts: { cho: 0, dang: 0, ra: 0 }, loading: true });
  const [selectedId, setSelectedId] = useState(null);
  const [patient, setPatient] = useState(null);
  const [counts, setCounts] = useState({});
  const [activeTab, setActiveTab] = useState('info');

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const [phieuOpen, setPhieuOpen] = useState(false);
  const [order, setOrder] = useState({ open: false, phieuId: null });
  const [version, setVersion] = useState(0);
  const [mockNotice, setMockNotice] = useState('');
  const [toast, setToast] = useState('');

  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const notify = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); }, []);

  useEffect(() => {
    const h = (e) => setMockNotice(e.detail || 'Không kết nối được backend');
    window.addEventListener('api:fallback', h);
    return () => window.removeEventListener('api:fallback', h);
  }, []);

  // 1) Bộ lọc → danh sách bệnh nhân
  useEffect(() => {
    let live = true;
    setList((l) => ({ ...l, loading: true }));
    api.listPatients(filters).then((r) => {
      if (!live) return;
      setList({ items: r.items, counts: r.counts, loading: false });
      setSelectedId((cur) => (r.items.some((p) => p.id === cur) ? cur : r.items[0]?.id ?? null));
    });
    return () => { live = false; };
  }, [filters, version]);

  // 2) Chọn bệnh nhân → tải chi tiết + số đếm các tab
  useEffect(() => {
    setEditing(false);
    if (!selectedId) { setPatient(null); setCounts({}); return; }
    let live = true;
    Promise.all([api.getPatient(selectedId), api.getCounts(selectedId)]).then(([p, c]) => {
      if (!live) return;
      setPatient(p); setCounts(c);
    });
    return () => { live = false; };
  }, [selectedId, version]);

  const startEdit = () => { setDraft({ ...patient }); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setDraft(null); };
  const saveEdit = async () => {
    await api.savePatient(draft);
    setEditing(false); setDraft(null); bump(); notify('Đã lưu bệnh án');
  };

  const value = useMemo(() => ({
    filters, setFilters, list, selectedId, selectPatient: setSelectedId, patient, counts,
    activeTab, setActiveTab,
    editing, draft, setDraft, startEdit, cancelEdit, saveEdit,
    phieuOpen, openPhieu: () => setPhieuOpen(true), closePhieu: () => setPhieuOpen(false),
    order, openOrder: (phieuId) => setOrder({ open: true, phieuId }), closeOrder: () => setOrder({ open: false, phieuId: null }),
    version, bump, mockNotice, toast, notify,
  }), [filters, list, selectedId, patient, counts, activeTab, editing, draft, phieuOpen, order, version, mockNotice, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const HisProvider = MedicalProvider; // Backward compatible alias
