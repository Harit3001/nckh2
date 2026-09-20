export default function Field({ label, required, className = '', children }) {
  return (
    <label className={`field ${className}`}>
      {label && <span className="field__label">{required && <b className="req">*</b>}{label}:</span>}
      <span className="field__control">{children}</span>
    </label>
  );
}

export function Input({ value, onChange, readOnly, className = '', ...rest }) {
  return (
    <input
      className={`input ${className}`}
      value={value ?? ''}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      {...rest}
    />
  );
}

export function Select({ value, onChange, options = [], disabled, placeholder = '' }) {
  return (
    <select className="input" value={value ?? ''} disabled={disabled} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}
