import { useState } from 'react';
import { useMedical } from '../../../context/MedicalContext.jsx';
import Field, { Input } from '../common/Field.jsx';
import Tabs from '../common/Tabs.jsx';
import { fmtDateTime, moneyEN, toInputDate } from '../../../utils/format.js';

export default function InfoTab() {
  const { patient, editing, draft, setDraft } = useMedical();
  const [sub, setSub] = useState('chandoan');
  const p = editing ? draft : patient;
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const ro = !editing;
  const F = (k, props = {}) => <Input value={p[k]} onChange={set(k)} readOnly={ro} {...props} />;

  return (
    <div className="info">
      <h3 className="section-title">I. HÀNH CHÍNH</h3>
      <div className="grid grid--5">
        <Field label="Họ và tên" className="span-2">{F('name')}</Field>
        <Field label="Sinh ngày"><input type="date" className="input" readOnly={ro} value={toInputDate(p.dob)} onChange={(e) => set('dob')(e.target.value)} /></Field>
        <Field label="Giới tính">{F('gender')}</Field>
        <Field label="Dân tộc">{F('danToc')}</Field>
        <Field label="Điện Thoại" className="span-2">{F('phone')}</Field>
        <Field label="Địa chỉ" className="span-3">{F('address')}</Field>
        <Field label="Đối tượng" className="span-2">{F('doiTuong')}</Field>
        <Field label="Số thẻ">{F('soThe')}</Field>
        <Field label="Hạn thẻ">{F('hanThe')}</Field>
        <Field label="Quốc tịch">{F('quocTich')}</Field>
        <Field label="Thông tin người nhà" className="span-5">{F('nguoiNha')}</Field>
        <Field label="B.sĩ Điều trị" required className="span-2">{F('bsDieuTri', { readOnly: true, disabled: true })}</Field>
        <Field label="Loại bệnh án" required className="span-2">{F('loaiBA', { readOnly: true, disabled: true })}</Field>
        <Field label="Số BA">
          <span className="range">
            <input className="input" readOnly value={p.soBA} /><input className="input" readOnly value={p.kyHieuBA} />
            <input className="input" readOnly value={p.maBA} /><input className="input" readOnly value={p.thangBA} />
          </span>
        </Field>
        <Field label="Khoa Đ.Trị" className="span-2">{F('khoa', { readOnly: true, disabled: true })}</Field>
        <Field label="Phòng" required className="span-2">{F('phong', { readOnly: true, disabled: true })}</Field>
        <Field label="Giường">{F('giuong', { readOnly: true, disabled: true })}</Field>
      </div>

      <Tabs items={[{ key: 'chandoan', label: 'Chẩn đoán' }, { key: 'nguoinha', label: 'Thông Tin người nhà' }]} active={sub} onChange={setSub} variant="tabs--sub" />

      {sub === 'chandoan' ? (
        <div className="split">
          <section>
            <h3 className="section-title">II. QUẢN LÝ NGƯỜI BỆNH</h3>
            <div className="status-line">{p.status}</div>
            <Field label="Đăng ký KCB"><Input value={fmtDateTime(p.dangKyKCB)} readOnly disabled /></Field>
            <Field label="Tiếp nhận tại"><Input value={p.tiepNhanTai} readOnly /></Field>
            <Field label="Vào khoa lúc"><Input value={fmtDateTime(p.vaoKhoaLuc)} readOnly disabled /></Field>

            <table className="table table--dense mt">
              <thead><tr><th>Khoa điều trị</th><th>Thời gian vào</th><th>Thời gian ra</th></tr></thead>
              <tbody>
                {p.khoaHistory.map((k, i) => (
                  <tr key={i}><td>{k.khoa}</td><td>{fmtDateTime(k.vao)}</td><td>{k.ra ? fmtDateTime(k.ra) : ''}</td></tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid--2 mt">
              <Field label="Tổng chi phí"><Input className="num" value={moneyEN(p.tongChiPhi)} readOnly /></Field>
              <Field label="Tạm ứng"><Input value={moneyEN(p.tamUng)} readOnly /></Field>
              <Field label="Công Nợ"><Input value={moneyEN(p.congNo)} readOnly /></Field>
              <Field label="Đã thu"><Input value={String(p.daThu)} readOnly /></Field>
            </div>
          </section>

          <section>
            <h3 className="section-title">III. CHẨN ĐOÁN VÀO KHOA</h3>
            <p className="kv"><b>1. KKB, Cấp cứu:</b> {p.kkbCapCuu}</p>
            <p className="kv"><b>2. Khoa điều trị:</b></p>
            <Field label="ICD Chính"><Input value={p.icdChinh} onChange={set('icdChinh')} readOnly={ro} /></Field>
            <Field label="Bệnh chính"><Input value={p.benhChinh} onChange={set('benhChinh')} readOnly={ro} /></Field>
            <Field label="Bệnh phụ">
              <span className="range">
                <Input className="w-sm" value={p.icdPhu} onChange={set('icdPhu')} readOnly={ro} />
                <Input value={p.benhPhu} onChange={set('benhPhu')} readOnly={ro} />
              </span>
            </Field>
            <Field label="Chẩn đoán">
              <textarea className="input textarea" rows={5} readOnly={ro} value={p.chanDoan} onChange={(e) => set('chanDoan')(e.target.value)} />
            </Field>
            <Field label="Bệnh YHCT"><Input value={p.benhYHCT} onChange={set('benhYHCT')} readOnly={ro} /></Field>
          </section>
        </div>
      ) : (
        <div className="grid grid--3 mt">
          {['hoTen:Họ tên người nhà', 'quanHe:Quan hệ', 'dienThoai:Điện thoại'].map((s) => {
            const [k, l] = s.split(':');
            return (
              <Field key={k} label={l}>
                <Input value={p.nguoiNhaInfo?.[k]} readOnly={ro} onChange={(v) => set('nguoiNhaInfo')({ ...p.nguoiNhaInfo, [k]: v })} />
              </Field>
            );
          })}
        </div>
      )}
    </div>
  );
}
