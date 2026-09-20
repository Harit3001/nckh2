import { useMedical } from '../../../context/MedicalContext.jsx';
import { fmtDate } from '../../../utils/format.js';

export default function PatientHeaderInfo({ compact = false }) {
  const { patient: p } = useMedical();
  if (!p) return null;
  return (
    <div className={`patient-head ${compact ? 'patient-head--compact' : ''}`}>
      <div className="patient-head__text">
        <div className="patient-head__name">
          {p.name} | {p.maBN} | {fmtDate(p.dob)} 00:00 | ({p.age} tuổi) {p.gender}
        </div>
        <div>{p.maKCB} | {p.maDT} | Hạn thẻ: {p.hanThe}</div>
        <div>{p.address}</div>
      </div>
      <div className="patient-head__badge"><span>{p.insurance}</span><b>{p.mucHuong}</b></div>
    </div>
  );
}
