import Field, { Input } from '../common/Field.jsx';
import { fmtDate, toInputDateTime } from '../../../utils/format.js';

/** Vùng thông tin + diễn biến + sinh hiệu của một phiếu điều trị. */
export default function PhieuForm({ patient, value, onChange, editable }) {
  const v = value;
  const set = (k) => (val) => onChange({ ...v, [k]: val });
  const ro = !editable;

  return (
    <div className="phieu-form">
      <div className="grid grid--2">
        <div>
          <Field label="Họ và tên"><Input value={patient.name} readOnly /></Field>
          <div className="grid grid--2">
            <Field label="Sinh ngày"><Input value={fmtDate(patient.dob) + ' 00:00'} readOnly disabled /></Field>
            <Field label="Tuổi"><Input value={`(${patient.age} Tuổi)`} readOnly /></Field>
          </div>
          <Field label="Phòng"><Input value={patient.phong} readOnly disabled /></Field>
          <Field label="Giường"><Input value={patient.giuong} readOnly disabled /></Field>
        </div>
        <div>
          <Field label="Giới tính"><Input value={patient.gender} readOnly /></Field>
          <Field label="ICD chính"><Input value={`${patient.icdChinh}  ${patient.benhChinh}`} readOnly /></Field>
          <Field label="Bệnh phụ"><Input value={`${patient.icdPhu}  ${patient.benhPhu}`} readOnly /></Field>
          <Field label="Chẩn đoán"><textarea className="input textarea" rows={2} readOnly value={patient.chanDoan} /></Field>
        </div>
      </div>

      <div className="grid grid--2 mt">
        <div>
          <Field label="Ngày Y lệnh">
            <input type="datetime-local" className="input" disabled={ro} value={toInputDateTime(v.ngay)} onChange={(e) => set('ngay')(new Date(e.target.value).toISOString())} />
          </Field>
          <Field label="Diễn biến">
            <textarea className="input textarea" rows={8} readOnly={ro} value={v.dienBien} onChange={(e) => set('dienBien')(e.target.value)} />
          </Field>
        </div>
        <div>
          <div className="grid grid--3">
            <Field label="Bác sĩ" required className="span-2"><Input value={v.bacSi} readOnly disabled /></Field>
            <Field label="ĐD"><Input value={v.dd} onChange={set('dd')} readOnly={ro} /></Field>
          </div>
          <Field label="Y lệnh">
            <textarea className="input textarea" rows={8} readOnly={ro} value={v.yLenh} onChange={(e) => set('yLenh')(e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="vitals mt">
        {[['mach', 'Mạch'], ['nhietDo', 'Nhiệt độ'], ['huyetAp', 'Huyết áp'], ['nhipTho', 'Nhịp thở'], ['canNang', 'Cân nặng(Kg)'], ['spo2', 'SpO2']].map(([k, l]) => (
          <Field key={k} label={l}><Input value={v[k]} onChange={set(k)} readOnly={ro} /></Field>
        ))}
        <Field label="Dinh dưỡng"><Input value={v.dinhDuong} onChange={set('dinhDuong')} readOnly={ro} /></Field>
        <Field label="Lời dặn đơn thuốc" className="vitals__wide"><Input value={v.loiDan} onChange={set('loiDan')} readOnly={ro} /></Field>
      </div>
    </div>
  );
}
