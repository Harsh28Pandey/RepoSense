import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6FDE] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-xs gap-2',
    lg: 'h-10 px-5 text-sm gap-2',
  };

  const variants = {
    primary: 'bg-[#2F6FDE] hover:bg-[#2459B8] text-[#FAFBFC] border border-transparent shadow-xs',
    secondary: 'bg-[#F7F8FA] hover:bg-[#E8ECF1] text-[#1F2A37] border border-[#D3D9E2]',
    subtle: 'bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#1F2A37] border border-transparent',
    ghost: 'hover:bg-[#E8ECF1] text-[#5B6778] hover:text-[#1F2A37]',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-[#FAFBFC] border border-transparent',
    success: 'bg-[#2E8B57] hover:bg-[#236A42] text-[#FAFBFC] border border-transparent',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-10 h-10 p-2.5',
  };

  return (
    <Button
      variant={variant}
      className={`${sizes[size]} !px-0 ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" strokeWidth={1.5} />}
    </Button>
  );
}

export function Input({
  label,
  error,
  hint,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#1F2A37]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-[#8B96A5] pointer-events-none">
            <Icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full h-9 bg-[#E8ECF1] border ${
            error ? 'border-[#DC2626]' : 'border-[#D3D9E2]'
          } rounded-2xl text-xs text-[#1F2A37] placeholder-[#8B96A5] focus:bg-[#FAFBFC] focus:border-[#2F6FDE] focus:outline-none transition-colors duration-150 ${
            Icon ? 'pl-9' : 'px-3'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#DC2626] font-medium">{error}</span>}
      {hint && !error && <span className="text-xs text-[#5B6778]">{hint}</span>}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  className = '',
  id,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#1F2A37]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full h-9 bg-[#E8ECF1] border ${
          error ? 'border-[#DC2626]' : 'border-[#D3D9E2]'
        } rounded-2xl px-3 text-xs text-[#1F2A37] focus:bg-[#FAFBFC] focus:border-[#2F6FDE] focus:outline-none transition-colors duration-150 cursor-pointer ${className}`}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && <span className="text-xs text-[#DC2626] font-medium">{error}</span>}
    </div>
  );
}

export function Checkbox({ label, description, id, checked, onChange, className = '', ...props }) {
  const checkId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <input
        type="checkbox"
        id={checkId}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 w-4 h-4 rounded border-[#D3D9E2] text-[#2F6FDE] focus:ring-[#2F6FDE] accent-[#2F6FDE] cursor-pointer"
        {...props}
      />
      {(label || description) && (
        <div className="flex flex-col text-xs leading-none select-none">
          {label && (
            <label htmlFor={checkId} className="font-semibold text-[#1F2A37] cursor-pointer">
              {label}
            </label>
          )}
          {description && <span className="text-xs text-[#5B6778] mt-1">{description}</span>}
        </div>
      )}
    </div>
  );
}

export function Switch({ checked, onChange, label, id }) {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center justify-between gap-3">
      {label && (
        <label htmlFor={switchId} className="text-xs font-semibold text-[#1F2A37] cursor-pointer">
          {label}
        </label>
      )}
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange && onChange(!checked)}
        className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6FDE] cursor-pointer ${
          checked ? 'bg-[#2F6FDE]' : 'bg-[#D3D9E2]'
        }`}
      >
        <span
          className={`bg-[#FAFBFC] w-5 h-5 rounded-full shadow-xs transform transition-transform duration-150 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className = '',
}) {
  const variants = {
    neutral: 'bg-[#E8ECF1] text-[#1F2A37] border-[#D3D9E2]',
    accent: 'bg-[#E8ECF1] text-[#2F6FDE] border-[#BAC2CE]',
    success: 'bg-[#DDEEE4] text-[#2E8B57] border-[#2E8B57]/30',
    warning: 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/30',
    danger: 'bg-[#FEE2E2] text-[#DC2626] border-[#EF4444]/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-2xl border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" strokeWidth={1.5} />}
      <span>{children}</span>
    </span>
  );
}

export function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`bg-[#F7F8FA] border border-[#D3D9E2] rounded-2xl overflow-hidden shadow-xs transition-colors duration-150 ${className}`}
      {...props}
    >
      {header && <div className="px-5 py-4 border-b border-[#D3D9E2] bg-[#FAFBFC]">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-[#D3D9E2] bg-[#E8ECF1]">{footer}</div>}
    </div>
  );
}

export function Table({ headers = [], children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-[#D3D9E2] bg-[#F7F8FA] ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        {headers.length > 0 && (
          <thead>
            <tr className="bg-[#E8ECF1] border-b border-[#D3D9E2] text-xs font-semibold text-[#5B6778]">
              {headers.map((h, idx) => (
                <th key={idx} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-[#D3D9E2]">{children}</tbody>
      </table>
    </div>
  );
}

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 bg-[#E8ECF1] p-1 rounded-2xl border border-[#D3D9E2] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-2xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-[#FAFBFC] text-[#2F6FDE] shadow-xs'
                : 'text-[#5B6778] hover:text-[#1F2A37] hover:bg-[#D3D9E2]/50'
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2A37]/30 backdrop-blur-xs">
      <div
        className={`bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#D3D9E2] flex items-center justify-between bg-[#F7F8FA]">
          <h3 className="text-sm font-bold text-[#1F2A37]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#5B6778] hover:text-[#1F2A37] p-1 rounded-2xl hover:bg-[#E8ECF1] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto text-xs text-[#1F2A37]">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-[#D3D9E2] bg-[#E8ECF1] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Dropdown({ trigger, items = [], className = '' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute right-0 mt-2 w-48 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] shadow-lg z-20 py-1.5 animate-fadeIn ${className}`}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick && item.onClick();
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs text-[#1F2A37] hover:bg-[#E8ECF1] flex items-center gap-2 transition-colors cursor-pointer ${
                  item.danger ? 'text-[#DC2626] hover:bg-[#FEE2E2]' : ''
                }`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Tooltip({ children, text }) {
  const [show, setShow] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-medium bg-[#1F2A37] text-[#FAFBFC] rounded-2xl whitespace-nowrap shadow-md z-30 pointer-events-none">
          {text}
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = '', height = 'h-4', width = 'w-full' }) {
  return (
    <div className={`bg-[#E8ECF1] animate-pulse rounded-2xl ${height} ${width} ${className}`} />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#F7F8FA] border border-[#D3D9E2] rounded-2xl my-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#E8ECF1] flex items-center justify-center text-[#5B6778] mb-3">
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      )}
      <h4 className="text-sm font-bold text-[#1F2A37] mb-1">{title}</h4>
      {description && <p className="text-xs text-[#5B6778] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Error Loading Data', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#FEE2E2] border border-[#EF4444]/30 rounded-2xl text-center">
      <h4 className="text-sm font-bold text-[#DC2626] mb-1">{title}</h4>
      {message && <p className="text-xs text-[#5B6778] mb-3">{message}</p>}
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function Kbd({ children }) {
  return (
    <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#5B6778] bg-[#E8ECF1] border border-[#D3D9E2] rounded-2xl shadow-2xs">
      {children}
    </kbd>
  );
}

export function CodeBlock({ code, language = 'text' }) {
  return (
    <div className="rounded-2xl border border-[#D3D9E2] bg-[#E8ECF1] p-3 overflow-x-auto text-xs font-mono text-[#1F2A37]">
      <pre className="!bg-transparent !p-0 !border-none">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function DiffViewer({ oldCode = '', newCode = '' }) {
  return (
    <div className="rounded-2xl border border-[#D3D9E2] bg-[#F7F8FA] overflow-hidden text-xs font-mono">
      <div className="bg-[#E8ECF1] px-4 py-2 border-b border-[#D3D9E2] text-xs font-bold text-[#5B6778]">
        Code Diff View
      </div>
      <div className="p-3 divide-y divide-[#D3D9E2]">
        {oldCode && (
          <div className="bg-[#FEE2E2] text-[#DC2626] px-3 py-1.5 rounded-2xl mb-1 flex items-center gap-2">
            <span>-</span>
            <span>{oldCode}</span>
          </div>
        )}
        {newCode && (
          <div className="bg-[#DDEEE4] text-[#2E8B57] px-3 py-1.5 rounded-2xl flex items-center gap-2">
            <span>+</span>
            <span>{newCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Stat({ label, value, trend, icon: Icon }) {
  return (
    <div className="p-4 bg-[#F7F8FA] border border-[#D3D9E2] rounded-2xl flex items-center justify-between">
      <div>
        <span className="text-xs font-medium text-[#5B6778]">{label}</span>
        <div className="text-xl font-bold text-[#1F2A37] mt-1 tabular-nums">{value}</div>
        {trend && <div className="text-xs text-[#2E8B57] font-semibold mt-0.5">{trend}</div>}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-2xl bg-[#E8ECF1] flex items-center justify-center text-[#2F6FDE]">
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

export function ScoreGauge({ score = 0, label = 'Health Score' }) {
  const getScoreColor = (val) => {
    if (val >= 80) return { bg: 'bg-[#DDEEE4]', text: 'text-[#2E8B57]', border: 'border-[#2E8B57]/30' };
    if (val >= 50) return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#F59E0B]/30' };
    return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', border: 'border-[#EF4444]/30' };
  };

  const style = getScoreColor(score);

  return (
    <div
      className={`p-4 rounded-2xl border ${style.border} ${style.bg} flex flex-col items-center justify-center text-center`}
    >
      <span className={`text-2xl font-extrabold tabular-nums ${style.text}`}>{score}/100</span>
      <span className="text-xs font-bold text-[#1F2A37] mt-1">{label}</span>
    </div>
  );
}

export { default as Avatar, getAvatarFallbackLetter, sanitizeAvatarUrl } from './Avatar';

