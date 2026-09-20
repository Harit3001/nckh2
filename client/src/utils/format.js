export const moneyEN = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const moneyVN = (n) =>
  Number(n || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const p = (n) => String(n).padStart(2, '0');
export const fmtDate = (d) => {
  const x = new Date(d);
  return isNaN(x) ? '' : `${p(x.getDate())}/${p(x.getMonth() + 1)}/${x.getFullYear()}`;
};
export const fmtDateTime = (d) => {
  const x = new Date(d);
  return isNaN(x) ? '' : `${fmtDate(x)} ${p(x.getHours())}:${p(x.getMinutes())}`;
};
export const toInputDate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
};

export function buildUsage({ s = 0, t = 0, c = 0, n = 0 }, timing = 'Sau ăn') {
  const parts = [];
  if (s) parts.push(`Sáng: ${s}`);
  if (t) parts.push(`Trưa: ${t}`);
  if (c) parts.push(`Chiều: ${c}`);
  if (n) parts.push(`Tối: ${n}`);
  return `${parts.join('; ')}; (${timing})`;
}

export const toInputDateTime = (d) => {
  const x = new Date(d);
  return `${toInputDate(x)}T${p(x.getHours())}:${p(x.getMinutes())}`;
};
