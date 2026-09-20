/**
 * Tất cả đường dẫn backend cho Medical Records / Bệnh án nằm ở đây.
 * Component không gọi trực tiếp path; chúng đi qua src/services/medical/medicalService.js.
 */
export const ENDPOINTS = {
  login: '/auth/login',

  patients: '/benh-an',                        // GET  ?from&to&status&type&room&doctor&maKCB
  patient: (id) => `/benh-an/${id}`,           // GET / PUT
  counts: (id) => `/benh-an/${id}/tong-hop`,   // GET  số lượng cho các tab

  phieuList: (pid) => `/benh-an/${pid}/phieu-dieu-tri`,          // GET / POST
  phieu: (pid, id) => `/benh-an/${pid}/phieu-dieu-tri/${id}`,    // PUT / DELETE
  phieuDrugs: (pid, id) => `/benh-an/${pid}/phieu-dieu-tri/${id}/thuoc`, // GET / POST
  phieuDrug: (pid, id, did) => `/benh-an/${pid}/phieu-dieu-tri/${id}/thuoc/${did}`, // DELETE / PUT

  drugCatalog: '/danh-muc/thuoc',              // GET ?q
  serviceCatalog: '/danh-muc/dich-vu',         // GET ?category&q&page&size
  execRooms: '/danh-muc/phong-thuc-hien',      // GET ?serviceId

  orders: (pid) => `/benh-an/${pid}/chi-dinh`, // GET ?group  / POST
  history: (pid) => `/benh-an/${pid}/lich-su-kcb`,
  records: (pid) => `/benh-an/${pid}/blockchain`, // các phiên bản + hash trên chuỗi
  print: (pid, kind) => `/benh-an/${pid}/in/${kind}`,
};
