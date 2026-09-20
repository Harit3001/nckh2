/**
 * Dữ liệu mẫu (đã ẩn danh) dựa theo bố cục các màn hình gốc.
 * Dùng khi backend chưa nối được — xem VITE_USE_MOCK trong .env.
 */
import { buildUsage } from '../../utils/format.js';

const wait = (v, ms = 140) => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms));
let seq = 100;
const uid = (p) => `${p}${String(Date.now()).slice(-6)}${seq++}`;
const at = (h, m, day = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + day);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const fakeHash = () => '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

/* ---------------- Danh mục ---------------- */
export const KHOA = 'KHOA NỘI TIÊU HÓA-THẦN KINH';

const DRUGS = [
  { id: 'd1', hoatChat: 'Acetyl leucin', ten: 'Zentanil', nguon: 'BH', dvt: 'Lọ', hamLuong: '1g/10ml', duong: 'Tiêm', cachDung: 'Sáng: 1; Chiều: 1; (Sau ăn) tiêm TMC' },
  { id: 'd2', hoatChat: 'Piracetam', ten: 'Piracetam 800 mg', nguon: 'BH', dvt: 'Viên', hamLuong: '800mg', duong: 'Uống', cachDung: 'Sáng: 1; Chiều: 1; (Sau ăn) 11h30-19h30' },
  { id: 'd3', hoatChat: 'Cinnarizin', ten: 'Cinnarizin Pharma', nguon: 'BH', dvt: 'Viên', hamLuong: '25mg', duong: 'Uống', cachDung: 'Sáng: 1; Chiều: 1; (Sau ăn) 11h30-19h30' },
  { id: 'd4', hoatChat: 'Betahistin', ten: 'Betaserc 24mg', nguon: 'VP', dvt: 'Viên', hamLuong: '24mg', duong: 'Uống', cachDung: 'Sáng: 1; Chiều: 1; (Sau ăn) 11h30-19h30' },
  { id: 'd5', hoatChat: 'Sulpirid', ten: 'Dogtapine', nguon: 'BH', dvt: 'Viên', hamLuong: '50mg', duong: 'Uống', cachDung: 'Sáng: 1; Chiều: 1; (Sau ăn) 11h30-19h30' },
  { id: 'd6', hoatChat: 'Methyl prednisolon', ten: 'Medlon 16', nguon: 'BH', dvt: 'Viên', hamLuong: '16mg', duong: 'Uống', cachDung: 'Sáng: 1; (Sau ăn) 11h30' },
  { id: 'd7', hoatChat: 'Vitamin B1 + B6 + B12', ten: 'Vitamin 3B Extra', nguon: 'BH', dvt: 'Viên', hamLuong: '100mg + 100mg + 150mcg', duong: 'Uống', cachDung: 'Sáng: 1; Chiều: 1; (Sau ăn) 11h30-19h30' },
  { id: 'd8', hoatChat: '', ten: 'Bơm tiêm MPV sử dụng một lần 10ml', nguon: 'BH', dvt: 'Cái', hamLuong: '', duong: '', cachDung: 'Sáng: 1; Chiều: 1; ()' },
  { id: 'd9', hoatChat: '', ten: 'Kim tiêm MPV', nguon: 'BH', dvt: 'Cái', hamLuong: '', duong: '', cachDung: 'Sáng: 1; Chiều: 1; ()' },
];

export const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'xn', label: 'XÉT NGHIỆM' },
  { key: 'kb', label: 'KHÁM BỆNH' },
  { key: 'cdha', label: 'CHẨN ĐOÁN HÌNH ẢNH' },
  { key: 'pt', label: 'PHẪU THUẬT' },
  { key: 'tt', label: 'THỦ THUẬT' },
  { key: 'tdcn', label: 'THĂM DÒ CHỨC NĂNG' },
  { key: 'gb', label: 'GIƯỜNG BỆNH' },
  { key: 'khac', label: 'KHÁC' },
  { key: 'skb', label: 'Sổ khám bệnh' },
];
const GROUP_OF = { xn: 'XN', cdha: 'CDHA', tdcn: 'CDHA', pt: 'PTTT', tt: 'PTTT' };

const SERVICES = [
  { id: 's1', code: '14.0244.0015', name: 'Chụp đáy mắt không huỳnh quang', category: 'tt', loaiPttt: 'Thủ thuật loại 1', bhyt: 222300, vienPhi: 222300, onlyPrice: false },
  { id: 's2', code: '', name: 'Điện giải nước tiểu 24h (Gửi mẫu Medlatec)', category: 'xn', bhyt: 0, vienPhi: 68900 },
  { id: 's3', code: '', name: 'Gói khám SKĐK và phát hiện sớm ung thư buồng trứng (PL18)', category: 'kb', bhyt: 0, vienPhi: 1600000 },
  { id: 's4', code: '', name: 'Gói khám SKĐK và phát hiện sớm ung thư cổ tử cung (PL19)', category: 'kb', bhyt: 0, vienPhi: 2300000 },
  { id: 's5', code: '', name: 'Gói khám sức khỏe đi nước ngoài', category: 'kb', bhyt: 0, vienPhi: 1100000 },
  { id: 's6', code: '11.1898', name: 'Khám Bỏng', category: 'kb', bhyt: 39800, vienPhi: 150000, onlyPrice: true },
  { id: 's7', code: '', name: 'Khám chuyên gia (BGĐ, Trưởng khoa)', category: 'kb', bhyt: 0, vienPhi: 250000 },
  { id: 's8', code: '', name: 'Khám chuyên gia (BGĐ, Trưởng khoa) (khám CK lần 2 trong ngày)', category: 'kb', bhyt: 0, vienPhi: 125000 },
  { id: 's9', code: '', name: 'Khám chuyên gia (tuyến trung ương)', category: 'kb', bhyt: 0, vienPhi: 500000 },
  { id: 's10', code: '', name: 'Khám chuyên gia (tuyến trung ương) (khám CK lần 2 trong ngày)', category: 'kb', bhyt: 0, vienPhi: 250000 },
  { id: 's11', code: 'DV00000350', name: 'Điện tim thường', category: 'tdcn', bhyt: 39900, vienPhi: 39900 },
  { id: 's12', code: 'DV00004113', name: 'Chụp Xquang ngực thẳng (Chụp X-quang số hóa 1 phim)', category: 'cdha', bhyt: 73300, vienPhi: 73300 },
  { id: 's13', code: 'DV00003942', name: 'Siêu âm ổ bụng (gan mật, tụy, lách, thận, bàng quang)', category: 'cdha', bhyt: 58600, vienPhi: 58600 },
  { id: 's14', code: 'DV00001096', name: 'Đo lưu huyết não', category: 'tdcn', bhyt: 50500, vienPhi: 50500 },
  { id: 's15', code: 'DV00003970', name: 'Doppler động mạch cảnh, Doppler xuyên sọ', category: 'cdha', bhyt: 252300, vienPhi: 252300 },
  { id: 's16', code: 'XN0001', name: 'Tổng phân tích tế bào máu ngoại vi', category: 'xn', bhyt: 46200, vienPhi: 46200 },
  { id: 's17', code: 'XN0002', name: 'Định lượng Glucose máu', category: 'xn', bhyt: 21600, vienPhi: 21600 },
  { id: 's18', code: 'XN0003', name: 'Định lượng Cholesterol toàn phần', category: 'xn', bhyt: 26900, vienPhi: 26900 },
  { id: 's19', code: 'XN0004', name: 'Đo hoạt độ AST (GOT)', category: 'xn', bhyt: 21600, vienPhi: 21600 },
  { id: 's20', code: 'XN0005', name: 'Đo hoạt độ ALT (GPT)', category: 'xn', bhyt: 21600, vienPhi: 21600 },
  { id: 's21', code: 'GB0001', name: 'Giường nội khoa hạng 2', category: 'gb', bhyt: 200000, vienPhi: 200000 },
].map((s) => ({ ...s, group: GROUP_OF[s.category] || 'KHAC' }));

const ROOMS = [
  { name: 'Khoa Chẩn đoán hình ảnh', total: 14, waiting: 3, active: 1 },
  { name: 'Khoa Xét nghiệm', total: 32, waiting: 5, active: 2 },
  { name: 'Phòng Thăm dò chức năng', total: 9, waiting: 1, active: 0 },
];

/* ---------------- Bệnh nhân ---------------- */
const PEOPLE = [
  ['NGUYỄN VĂN AN', false], ['TRẦN THỊ BÌNH', true], ['LÊ THỊ CÚC', false],
  ['PHẠM VĂN DŨNG', false], ['VÕ THỊ EM', false], ['HOÀNG THỊ GẤM', true],
  ['ĐẶNG VĂN HÙNG', true], ['BÙI THỊ LAN', false], ['NGÔ VĂN MINH', true],
];

const makePatient = (i, name, cc) => ({
  id: `p${i}`, tt: i, name, cc, insurance: 'BH',
  maBN: `BN2607${String(i).padStart(8, '0')}`,
  maKCB: `KCB26070${String(i).padStart(5, '0')}`,
  maDT: `DN40000000${String(i).padStart(4, '0')}`,
  dob: '1976-01-16', age: 50, gender: 'Nữ', danToc: 'Kinh', quocTich: 'Việt Nam',
  phone: '0900000000', address: 'Xã Mẫu, Tỉnh Mẫu',
  doiTuong: 'Khám Bảo Hiểm(80%)', mucHuong: 80, soThe: `DN40000000${String(i).padStart(4, '0')}`, hanThe: '31/12/2026',
  nguoiNha: 'Người nhà, Cùng địa chỉ',
  bsDieuTri: '000001 | BS. Điều trị', loaiBA: 'Bệnh Án Nội khoa',
  soBA: `0240${40 + i}`, kyHieuBA: 'NT', maBA: 'NTH-TK.7', thangBA: '07/2026',
  khoa: KHOA, phong: 'Phòng điều trị nội trú 807', giuong: '',
  status: i === 9 ? 'Đã ra viện' : 'Đang điều trị', type: 'noitru',
  dangKyKCB: at(10, 32), tiepNhanTai: 'K01|KHOA KHÁM BỆNH', vaoKhoaLuc: at(10, 50),
  khoaHistory: [
    { khoa: KHOA, vao: at(10, 50), ra: null },
    { khoa: 'KHOA KHÁM BỆNH - KB.4', vao: at(10, 32), ra: at(10, 49) },
  ],
  tongChiPhi: 835303.6, tamUng: 1000000, congNo: 835303.6, daThu: 0,
  kkbCapCuu: 'Phòng Khám Nội Tiêu hóa thần kinh 101 | (G47.0) Rối loạn vào giấc và/hoặc rối loạn duy trì giấc ngủ [chứng mất ngủ]',
  icdChinh: 'G47.0',
  benhChinh: '(G47.0) Rối loạn vào giấc và/hoặc rối loạn duy trì giấc ngủ [chứng mất ngủ]',
  icdPhu: 'F48.0', benhPhu: '(F48.0) Suy nhược thần kinh',
  chanDoan: '(G47.0) Rối loạn vào giấc và/hoặc rối loạn duy trì giấc ngủ [chứng mất ngủ];(F48.0) Suy nhược thần kinh',
  benhYHCT: '', nguoiNhaInfo: { hoTen: '', quanHe: '', dienThoai: '' },
});

const blankPhieu = (ngay, code, drugs = []) => ({
  id: code, ngay, bacSi: '000001 | BS. Điều trị', nguoiLap: 'BS. Điều trị', khoa: KHOA,
  dienBien: '- Lý do vào viện: Đau đầu, chóng mặt, bất an, mất ngủ.\n- Toàn thân: Tỉnh táo, tiếp xúc tốt.\n- Tuần hoàn: Nhịp tim đều rõ.\n- Hướng điều trị: Nội khoa.',
  yLenh: '', mach: 75, nhietDo: 37, huyetAp: '140/80', nhipTho: 20, canNang: 62, spo2: 95,
  dinhDuong: 'BT01 - Cháo', loiDan: '', dd: '', cSoc: 'Cấp III', hoSinh: false,
  drugs, services: [],
});

const db = { patients: [], phieu: {}, orders: {}, records: {} };
PEOPLE.forEach(([name, cc], idx) => {
  const p = makePatient(idx + 1, name, cc);
  db.patients.push(p);
  db.phieu[p.id] = [
    blankPhieu(at(11, 5, -1), `PDT26070${p.tt}1594`, DRUGS.map((d, k) => ({ ...d, rowId: `${p.id}-d${k}`, ngayTH: at(11, 5, -1), soNgay: 1, soLuong: 1 }))),
    blankPhieu(at(7, 3), `PDT26070${p.tt}1691`),
  ];
  const first = db.phieu[p.id][0];
  db.orders[p.id] = ['s11', 's12', 's13', 's14', 's15', 's16', 's17', 's18', 's19'].map((sid, k) => {
    const s = SERVICES.find((x) => x.id === sid);
    return { rowId: `${p.id}-o${k}`, serviceId: s.id, code: s.code, name: s.name, group: s.group, qty: 1, price: s.bhyt || s.vienPhi, phieuId: first.id, phieuAt: first.ngay, bacSi: first.bacSi, khoa: KHOA, status: 'done' };
  });
  db.records[p.id] = [{ version: 1, action: 'Tạo bệnh án', at: at(10, 50, -1), by: 'BS. Điều trị', hash: fakeHash(), txId: fakeHash() }];
});

const pushRecord = (pid, action) => {
  const list = db.records[pid];
  list.unshift({ version: list.length + 1, action, at: new Date().toISOString(), by: 'BS. Điều trị', hash: fakeHash(), txId: fakeHash() });
};

/* ---------------- API mẫu ---------------- */
export const login = () => wait({ token: '' });

export function listPatients(f = {}) {
  let rows = db.patients.filter((p) => (f.type ? p.type === f.type : true));
  const all = rows;
  if (f.status && f.status !== 'Tất cả bệnh nhân') {
    rows = f.status === 'B.nhân BHYT' ? rows.filter((p) => p.insurance === 'BH') : rows.filter((p) => p.status === f.status);
  }
  if (f.maKCB) rows = rows.filter((p) => p.maKCB.includes(f.maKCB));
  if (f.room) rows = rows.filter((p) => p.phong === f.room);
  return wait({
    items: rows,
    counts: { cho: 0, dang: all.filter((p) => p.status === 'Đang điều trị').length, ra: all.filter((p) => p.status === 'Đã ra viện').length + 34 },
  });
}
export const getPatient = (id) => wait(db.patients.find((p) => p.id === id));
export function savePatient(p) {
  const i = db.patients.findIndex((x) => x.id === p.id);
  db.patients[i] = { ...db.patients[i], ...p };
  pushRecord(p.id, 'Cập nhật hành chính');
  return wait(db.patients[i]);
}

export function getCounts(pid) {
  const o = db.orders[pid] || [];
  const by = (g) => o.filter((x) => x.group === g).length;
  return wait({
    thuocVT: (db.phieu[pid] || []).reduce((n, ph) => n + ph.drugs.length, 0),
    xn: by('XN'), cdha: by('CDHA'), pttt: by('PTTT'), khac: by('KHAC'),
  });
}

export const listPhieu = (pid) => wait(db.phieu[pid] || []);
export function savePhieu(pid, ph) {
  const list = db.phieu[pid];
  const i = list.findIndex((x) => x.id === ph.id);
  if (i >= 0) list[i] = { ...list[i], ...ph };
  else list.unshift({ ...blankPhieu(ph.ngay, ph.id || uid('PDT')), ...ph, id: ph.id || uid('PDT') });
  pushRecord(pid, i >= 0 ? 'Sửa phiếu điều trị' : 'Thêm phiếu điều trị');
  return wait(list[i >= 0 ? i : 0]);
}
export function deletePhieu(pid, id) {
  db.phieu[pid] = db.phieu[pid].filter((x) => x.id !== id);
  db.orders[pid] = db.orders[pid].filter((o) => o.phieuId !== id);
  pushRecord(pid, 'Xóa phiếu điều trị');
  return wait(true);
}

export const listDrugCatalog = (q = '') =>
  wait(DRUGS.filter((d) => (d.hoatChat + d.ten).toLowerCase().includes(q.toLowerCase())));
export function addPhieuDrug(pid, phieuId, drug) {
  const ph = db.phieu[pid].find((x) => x.id === phieuId);
  ph.drugs.push({
    ...drug, rowId: uid('d'), ngayTH: ph.ngay,
    cachDung: drug.cachDung || buildUsage(drug.stct || {}, drug.timing),
  });
  pushRecord(pid, 'Kê thuốc');
  return wait(ph.drugs);
}
export function removePhieuDrug(pid, phieuId, rowId) {
  const ph = db.phieu[pid].find((x) => x.id === phieuId);
  ph.drugs = ph.drugs.filter((d) => d.rowId !== rowId);
  return wait(ph.drugs);
}
export function movePhieuDrug(pid, phieuId, rowId, dir) {
  const ph = db.phieu[pid].find((x) => x.id === phieuId);
  const i = ph.drugs.findIndex((d) => d.rowId === rowId);
  const j = i + dir;
  if (j >= 0 && j < ph.drugs.length) [ph.drugs[i], ph.drugs[j]] = [ph.drugs[j], ph.drugs[i]];
  return wait(ph.drugs);
}

export function listServiceCatalog({ category = 'all', q = '', page = 1, size = 10 } = {}) {
  let rows = SERVICES;
  if (category !== 'all') rows = rows.filter((s) => s.category === category);
  if (q) rows = rows.filter((s) => (s.name + s.code).toLowerCase().includes(q.toLowerCase()));
  return wait({ items: rows.slice((page - 1) * size, page * size), total: rows.length });
}
export const listExecRooms = () => wait(ROOMS);

export function listOrders(pid, { group } = {}) {
  const o = db.orders[pid] || [];
  return wait(group ? o.filter((x) => x.group === group) : o);
}
export function saveOrders(pid, { phieuId, items }) {
  const ph = db.phieu[pid].find((x) => x.id === phieuId);
  items.forEach((it) => {
    db.orders[pid].push({
      rowId: uid('o'), serviceId: it.serviceId, code: it.code, name: it.name, group: it.group,
      qty: it.qty, price: it.price, phieuId, phieuAt: ph.ngay, bacSi: ph.bacSi, khoa: KHOA, status: 'pending',
    });
  });
  pushRecord(pid, `Chỉ định ${items.length} dịch vụ`);
  return wait(true);
}
export function updateDiagnosis(pid, { icdChinh, chanDoan }) {
  const p = db.patients.find((x) => x.id === pid);
  Object.assign(p, { icdChinh, chanDoan });
  pushRecord(pid, 'Cập nhật chẩn đoán');
  return wait(p);
}

export const listHistory = (pid) =>
  wait([
    { id: 1, ngay: at(10, 32), noi: 'KHOA KHÁM BỆNH - KB.4', loai: 'Khám bệnh', ketQua: 'Nhập viện' },
    { id: 2, ngay: at(10, 50), noi: KHOA, loai: 'Nội trú', ketQua: 'Đang điều trị' },
  ]);
export const listRecords = (pid) => wait(db.records[pid] || []);
export const printDoc = () => wait({ url: null });
