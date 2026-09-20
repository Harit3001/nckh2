import { useMedical } from '../../../context/MedicalContext.jsx';
import useAsync from '../../../hooks/useAsync.js';
import * as api from '../../../services/medical/medicalService.js';
import DataTable from '../common/DataTable.jsx';
import { fmtDateTime } from '../../../utils/format.js';

export default function MedicineTab() {
  const { patient, version, openPhieu } = useMedical();
  const { data, loading } = useAsync(
    () => api.listPhieu(patient.id).then((ps) => ps.flatMap((p) => p.drugs.map((d) => ({ ...d, phieuId: p.id })))),
    [patient.id, version], []
  );

  return (
    <>
      <DataTable
        rowKey="rowId"
        rows={data}
        empty={loading ? 'Đang tải…' : 'Chưa có thuốc - vật tư. Mở "Ph. điều trị" để kê.'}
        columns={[
          { key: 'ngayTH', title: 'Ngày TH Y lệnh', width: 130, render: (r) => fmtDateTime(r.ngayTH) },
          { key: 'phieuId', title: 'Phiếu', width: 140 },
          { key: 'hoatChat', title: 'Hoạt chất' },
          { key: 'ten', title: 'Tên thuốc - vật tư', render: (r) => <><span className={`tag tag--${r.nguon === 'VP' ? 'vp' : 'bh'}`}>{r.nguon}</span> <b>{r.ten}</b></> },
          { key: 'dvt', title: 'ĐVT', width: 60 },
          { key: 'hamLuong', title: 'Hàm lượng' },
          { key: 'duong', title: 'Đường dùng', width: 90 },
          { key: 'cachDung', title: 'Cách dùng' },
        ]}
      />
      <div className="actions"><button className="btn" onClick={openPhieu}>Mở phiếu điều trị</button></div>
    </>
  );
}
