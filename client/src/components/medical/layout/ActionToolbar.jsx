import { useMedical } from '../../../context/MedicalContext.jsx';
import PrintMenu from './PrintMenu.jsx';

export default function ActionToolbar() {
  const {
    patient, editing, startEdit, cancelEdit, saveEdit, setActiveTab, openPhieu, notify, list,
  } = useMedical();
  const none = !patient;
  const todo = (name) => () => notify(`${name}: chưa triển khai trong bản này`);

  return (
    <div className="toolbar">
      <div className="toolbar__buttons">
        <button className="btn" onClick={startEdit} disabled={none || editing}>✎ Sửa BA</button>
        <button className="btn" onClick={saveEdit} disabled={!editing}>💾 Lưu BA</button>
        <button className="btn" onClick={cancelEdit} disabled={!editing}>⊘ Hủy</button>
        <button className="btn" onClick={() => setActiveTab('info')} disabled={none}>▤ Hành chính</button>
        <button className="btn" disabled>▤ Chứng từ BH ▾</button>
        <button className="btn" onClick={openPhieu} disabled={none}>▮ Ph. điều trị</button>
        <button className="btn" onClick={todo('Chăm sóc')} disabled={none}>♡ Chăm sóc</button>
        <button className="btn" onClick={() => setActiveTab('thuoc')} disabled={none}>⚕ Thuốc - VT</button>
        <button className="btn" onClick={() => setActiveTab('emr')} disabled={none}>☰ Bệnh án</button>
        <button className="btn" onClick={todo('Giảm giá')} disabled={none}>🏷 Giảm giá</button>
        <button className="btn" onClick={todo('Chi phí')} disabled={none}>₫ Chi phí</button>
        <PrintMenu />
      </div>
      <div className="toolbar__dept">
        <strong>{patient?.khoa ?? 'KHOA NỘI TIÊU HÓA-THẦN KINH'}</strong>
        <span>Chờ NV: {list.counts.cho}/ Đang ĐT: {list.counts.dang}</span>
      </div>
    </div>
  );
}
