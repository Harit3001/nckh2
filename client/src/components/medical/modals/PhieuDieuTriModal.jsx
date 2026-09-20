import { useEffect, useMemo, useState } from 'react';
import { useMedical } from '../../../context/MedicalContext.jsx';
import useAsync from '../../../hooks/useAsync.js';
import * as api from '../../../services/medical/medicalService.js';
import Modal from '../common/Modal.jsx';
import Tabs from '../common/Tabs.jsx';
import DataTable from '../common/DataTable.jsx';
import PatientHeaderInfo from '../patients/PatientHeaderInfo.jsx';
import PrintMenu from '../layout/PrintMenu.jsx';
import PhieuList from './PhieuList.jsx';
import PhieuForm from './PhieuForm.jsx';
import PhieuDrugPanel from './PhieuDrugPanel.jsx';
import { fmtDateTime, moneyVN } from '../../../utils/format.js';

const blank = (p) => ({
  id: null, ngay: new Date().toISOString(), bacSi: p.bsDieuTri, nguoiLap: 'BS. Điều trị', khoa: p.khoa,
  dienBien: '', yLenh: '', mach: '', nhietDo: '', huyetAp: '', nhipTho: '', canNang: '', spo2: '',
  dinhDuong: '', loiDan: '', dd: '', cSoc: '', hoSinh: false,
});

export default function PhieuDieuTriModal() {
  const { patient, version, closePhieu, openOrder, bump, notify } = useMedical();
  const [mode, setMode] = useState('view'); // view | new | edit
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [q, setQ] = useState('');
  const [bottom, setBottom] = useState('thuoc');

  const { data: phieus, reload } = useAsync(() => api.listPhieu(patient.id), [patient.id, version], []);
  const { data: orders } = useAsync(() => api.listOrders(patient.id), [patient.id, version], []);

  useEffect(() => {
    if (!selectedId && phieus.length) setSelectedId(phieus[0].id);
  }, [phieus, selectedId]);

  const selected = useMemo(() => phieus.find((p) => p.id === selectedId) ?? null, [phieus, selectedId]);
  const view = mode === 'view' ? selected : draft;
  const myServices = orders.filter((o) => o.phieuId === selected?.id);
  const editable = mode !== 'view';

  const startNew = () => { setDraft(blank(patient)); setMode('new'); };
  const startEdit = () => { setDraft({ ...selected }); setMode('edit'); };
  const cancel = () => { setDraft(null); setMode('view'); };

  const remove = async () => {
    if (!selected || !window.confirm(`Xóa phiếu ${selected.id}?`)) return;
    await api.deletePhieu(patient.id, selected.id);
    setSelectedId(null); reload(); bump(); notify('Đã xóa phiếu điều trị');
  };

  const save = async () => {
    const { drugs, services, ...payload } = draft;
    const saved = await api.savePhieu(patient.id, payload, mode === 'new');
    setMode('view'); setDraft(null);
    if (saved?.id) setSelectedId(saved.id);
    reload(); notify('Đã lưu phiếu điều trị');
  };

  const close = () => { bump(); closePhieu(); }; // đóng → các tab phía sau tải lại số liệu mới

  return (
    <Modal title="Phiếu điều trị" onClose={close} level={1}>
      <div className="modal-toolbar">
        <div className="modal-toolbar__buttons">
          <button className="tool" onClick={startNew} disabled={editable}><i>＋</i>Thêm</button>
          <button className="tool" onClick={startEdit} disabled={editable || !selected}><i>✎</i>Sửa</button>
          <button className="tool tool--danger" onClick={remove} disabled={editable || !selected}><i>🗑</i>Xóa</button>
          <button className="tool" onClick={save} disabled={!editable}><i>💾</i>Lưu</button>
          <button className="tool" onClick={cancel} disabled={!editable}><i>⊘</i>Hủy</button>
          <button className="tool" onClick={() => openOrder(selected.id)} disabled={editable || !selected}><i>✎</i>Dịch vụ</button>
          <button className="tool" onClick={() => setBottom('trathuoc')}><i>⚕</i>DS trả thuốc</button>
          <PrintMenu label="In" className="tool" />
        </div>
        <PatientHeaderInfo compact />
      </div>

      <div className="phieu-layout">
        <PhieuList items={phieus} selectedId={selectedId} isNew={mode === 'new'} mode={mode} q={q} onQ={setQ}
          onSelect={(id) => setSelectedId(id)} />

        <div className="phieu-main">
          {view ? (
            <PhieuForm patient={patient} value={view} onChange={setDraft} editable={editable} />
          ) : <div className="empty">Chưa có phiếu điều trị — bấm “Thêm” để tạo phiếu đầu tiên.</div>}

          <Tabs
            variant="tabs--sub"
            active={bottom}
            onChange={setBottom}
            items={[
              { key: 'thuoc', label: 'Thuốc - Vật tư - Hóa chất', count: selected?.drugs.length ?? 0 },
              { key: 'dongy', label: 'Thuốc thang Đông Y', count: 0 },
              { key: 'dvkt', label: 'Dịch vụ kỹ thuật', count: myServices.length },
              { key: 'vtth', label: 'VTTH - Không tính tiền', count: 0 },
              { key: 'banle', label: 'Thuốc bán lẻ tại quầy', count: 0 },
              { key: 'trathuoc', label: 'Chi tiết trả thuốc', count: 0 },
            ]}
          />

          {bottom === 'thuoc' && <PhieuDrugPanel phieu={selected} disabled={editable} onChanged={reload} />}
          {bottom === 'dvkt' && (
            <DataTable
              rowKey="rowId" dense rows={myServices}
              empty='Phiếu này chưa có chỉ định — bấm "Dịch vụ" trên thanh công cụ.'
              columns={[
                { key: 'code', title: 'Mã DV', width: 120 },
                { key: 'name', title: 'Tên dịch vụ' },
                { key: 'qty', title: 'SL', width: 50, align: 'center' },
                { key: 'price', title: 'Đơn giá', width: 110, align: 'right', render: (r) => moneyVN(r.price) },
                { key: 'phieuAt', title: 'Ngày chỉ định', width: 140, render: (r) => fmtDateTime(r.phieuAt) },
              ]}
            />
          )}
          {['dongy', 'vtth', 'banle', 'trathuoc'].includes(bottom) && <div className="empty">No data</div>}
        </div>
      </div>
    </Modal>
  );
}
