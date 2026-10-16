import { useId, useState } from 'react';
import { Popover } from '@base-ui/react/popover';

export default function ToolDescription({ title, description }: { title: string; description: string }) {
  const [open, setOpen] = useState(false);
  const triggerId = useId();

  return <Popover.Root open={open} onOpenChange={setOpen} triggerId={triggerId}>
    <Popover.Trigger
      id={triggerId}
      className="tool-description-trigger"
      aria-label={`${title}说明`}
      openOnHover
      closeDelay={150}
      onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) setOpen(true); }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" />
      </svg>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner side="bottom" align="start" sideOffset={8} className="tool-description-positioner">
        <Popover.Popup className="tool-description-popup" initialFocus={false}>
          <Popover.Title className="app-visually-hidden">{title}说明</Popover.Title>
          <Popover.Description>{description}</Popover.Description>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>;
}
