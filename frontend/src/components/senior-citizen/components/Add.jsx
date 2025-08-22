export const LineInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}) => (
  <label className={`text-xs ${className}`}>
    <span className="block text-[11px] text-gray-700 mb-1">{label}</span>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border-b border-gray-500 focus:outline-none pb-0.5 text-sm text-center"
    />
  </label>
);

export const Radio = ({ name, value, setValue, options }) => (
  <div className="flex flex-wrap gap-6 text-sm">
    {options.map((opt) => (
      <label key={opt} className="inline-flex items-center gap-2">
        <input
          type="radio"
          name={name}
          checked={value === opt}
          onChange={() => setValue(opt)}
        />
        <span>{opt}</span>
      </label>
    ))}
  </div>
);

export const Check = ({ label, checked, onChange, children }) => (
  <label className="flex items-start gap-2 text-sm">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="leading-tight">
      {label}
      {children}
    </span>
  </label>
);

export const Section = ({ title, children }) => (
  <div className="border rounded-lg p-4 mb-4">
    <h3 className="font-semibold text-sm mb-3">{title}</h3>
    <div className="grid gap-3">{children}</div>
  </div>
);
