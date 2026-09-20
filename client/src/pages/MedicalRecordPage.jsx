import { MedicalProvider, useMedical } from '../context/MedicalContext.jsx';
import TopBar from '../components/medical/layout/TopBar.jsx';
import ActionToolbar from '../components/medical/layout/ActionToolbar.jsx';
import PatientSidebar from '../components/medical/patients/PatientSidebar.jsx';
import PatientTabs from '../components/medical/tabs/PatientTabs.jsx';
import PhieuDieuTriModal from '../components/medical/modals/PhieuDieuTriModal.jsx';
import ChiDinhDichVuModal from '../components/medical/modals/ChiDinhDichVuModal.jsx';
import '../styles/medical.css';

function MedicalContent() {
  const { phieuOpen, order, patient, mockNotice, toast } = useMedical();

  return (
    <div className="medical-app">
      <TopBar />
      {mockNotice && (
        <div className="banner" role="status">
          Đang dùng dữ liệu mẫu ({mockNotice}).
        </div>
      )}
      <ActionToolbar />
      <div className="workspace">
        <PatientSidebar />
        <PatientTabs />
      </div>

      {patient && phieuOpen && <PhieuDieuTriModal />}
      {patient && order.open && <ChiDinhDichVuModal />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default function MedicalRecordPage() {
  return (
    <MedicalProvider>
      <MedicalContent />
    </MedicalProvider>
  );
}
