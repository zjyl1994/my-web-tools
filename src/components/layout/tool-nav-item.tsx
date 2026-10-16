import { NavLink } from 'react-router-dom';
import { Tooltip } from '@base-ui/react/tooltip';
import ToolIcon from './tool-icon';

export default function ToolNavItem({ to, label, icon, expanded }: { to: string; label: string; icon: string; expanded: boolean }) {
  return <Tooltip.Root disabled={expanded}>
    <Tooltip.Trigger
      render={<NavLink to={to} end={to === '/'} aria-label={label} className={({ isActive }) => `tool-nav-link${isActive ? ' is-active' : ''}`} />}
    >
      <ToolIcon name={icon} /><span>{label}</span>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner side="right" sideOffset={12}>
        <Tooltip.Popup className="tool-nav-tooltip">{label}</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>;
}
