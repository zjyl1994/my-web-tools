import type { ReactNode } from 'react';

type ControlGroupProps = {
  children: ReactNode;
  label?: ReactNode;
  htmlFor?: string;
  suffix?: ReactNode;
  suffixId?: string;
  end?: ReactNode;
  compact?: boolean;
  className?: string;
};

/** A single-line control with an attached label, unit, or related action. */
export default function ControlGroup({
  children, label, htmlFor, suffix, suffixId, end, compact = false, className,
}: ControlGroupProps) {
  const classes = ['ui-control-group', compact && 'ui-control-group--compact', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {label != null && <label className="ui-control-group__label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {suffix != null && <span id={suffixId} className="ui-control-group__suffix">{suffix}</span>}
      {end != null && <div className="ui-control-group__end">{end}</div>}
    </div>
  );
}
