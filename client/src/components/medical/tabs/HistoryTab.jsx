import { useMedical } from '../../../context/MedicalContext.jsx';
import useAsync from '../../../hooks/useAsync.js';
import * as api from '../../../services/medical/medicalService.js';
import DataTable from '../common/DataTable.jsx';
import { fmtDateTime } from '../../../utils/format.js';

export default function HistoryTab() {
  const { patient } = useMedical();
  const { data, loading } = useAsync(() => api.listHistory(patient.id), [patient.id], []);
  return (
    <DataTable
      rows={data}
      empty={loading ? 'Đang tải…' : 'Chưa có lịch sử khám chữa bệnh'}
      columns={[
        { key: 'ngay', title: 'Thời gian', width: 150, render: (r) => fmtDateTime(r.ngay) },
        { key: 'noi', title: 'Nơi khám / khoa' },
        { key: 'loai', title: 'Loại', width: 120 },
        { key: 'ketQua', title: 'Kết quả', width: 140 },
      ]}
    />
  );
}
