import { useMedical } from '../../../context/MedicalContext.jsx';
import useAsync from '../../../hooks/useAsync.js';
import * as api from '../../../services/medical/medicalService.js';
import DataTable from '../common/DataTable.jsx';
import { fmtDateTime } from '../../../utils/format.js';

/** Bệnh án điện tử: mỗi thay đổi ghi lên blockchain — hiển thị phiên bản, hash, tx. */
export default function EmrTab() {
  const { patient, version } = useMedical();
  const { data, loading } = useAsync(() => api.listRecords(patient.id), [patient.id, version], []);
  return (
    <DataTable
      rowKey="version"
      rows={data}
      empty={loading ? 'Đang tải…' : 'Chưa có bản ghi trên chuỗi'}
      columns={[
        { key: 'version', title: 'Phiên bản', width: 90, align: 'center', render: (r) => `v${r.version}` },
        { key: 'action', title: 'Thao tác' },
        { key: 'at', title: 'Thời gian', width: 150, render: (r) => fmtDateTime(r.at) },
        { key: 'by', title: 'Người thực hiện', width: 150 },
        { key: 'hash', title: 'Hash nội dung', width: 190, render: (r) => <code>{r.hash}</code> },
        { key: 'txId', title: 'Giao dịch', width: 190, render: (r) => <code>{r.txId}</code> },
      ]}
    />
  );
}
