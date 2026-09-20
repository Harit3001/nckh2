import { useMedical } from '../../../context/MedicalContext.jsx';
import Tabs from '../common/Tabs.jsx';
import PatientHeaderInfo from '../patients/PatientHeaderInfo.jsx';
import InfoTab from './InfoTab.jsx';
import MedicineTab from './MedicineTab.jsx';
import OrdersTab from './OrdersTab.jsx';
import HistoryTab from './HistoryTab.jsx';
import EmrTab from './EmrTab.jsx';

export default function PatientTabs() {
  const { patient, counts, activeTab, setActiveTab } = useMedical();

  if (!patient) {
    return <section className="main card"><div className="empty empty--lg">Chọn một bệnh nhân ở danh sách bên trái</div></section>;
  }

  const items = [
    { key: 'info', label: 'Thông tin bệnh nhân' },
    { key: 'thuoc', label: 'Thuốc-Vật tư', count: counts.thuocVT },
    { key: 'xn', label: 'Xét nghiệm', count: counts.xn },
    { key: 'cdha', label: 'CĐHA-TDCN', count: counts.cdha },
    { key: 'pttt', label: 'Phẫu thuật-Thủ thuật', count: counts.pttt },
    { key: 'khac', label: 'Dịch vụ Khác', count: counts.khac },
    { key: 'history', label: 'Lịch sử KCB' },
    { key: 'emr', label: 'Bệnh án điện tử' },
  ];

  return (
    <section className="main card">
      <div className="main__top">
        <em className="muted-orange">Người thực hiện:</em>
        <PatientHeaderInfo />
      </div>
      <Tabs items={items} active={activeTab} onChange={setActiveTab} />
      <div className="main__panel">
        {activeTab === 'info' && <InfoTab />}
        {activeTab === 'thuoc' && <MedicineTab />}
        {activeTab === 'xn' && <OrdersTab group="XN" />}
        {activeTab === 'cdha' && <OrdersTab group="CDHA" />}
        {activeTab === 'pttt' && <OrdersTab group="PTTT" />}
        {activeTab === 'khac' && <OrdersTab group="KHAC" />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'emr' && <EmrTab />}
      </div>
    </section>
  );
}
