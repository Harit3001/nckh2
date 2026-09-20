export default function Tabs({ items, active, onChange, variant = '' }) {
  return (
    <div className={`tabs ${variant}`} role="tablist">
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          className={`tabs__item ${active === t.key ? 'is-active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}{t.count != null ? ` [${t.count}]` : ''}
        </button>
      ))}
    </div>
  );
}
