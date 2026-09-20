import { useMedical } from '../../../context/MedicalContext.jsx';

export default function TopBar() {
  const { patient } = useMedical();
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="logo">TTH</span>
        <span className="topbar__hospital">BV ĐA KHOA TTH QUẢNG BÌNH</span>
      </div>
      <input className="topbar__search" placeholder="nội dung tìm kiếm" aria-label="Tìm kiếm" />
      <div className="topbar__user">
        <span className="avatar" />
        <span>qb1.user</span>
        <span>[ BS. Điều trị ]</span>
        <span>[ {patient?.khoa ?? 'KHOA NỘI TIÊU HÓA-THẦN KINH'} ]</span>
      </div>
    </header>
  );
}
