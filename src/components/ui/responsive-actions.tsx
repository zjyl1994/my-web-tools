import { Button, Dropdown } from '@/components/ui';

type Action = { label: string; onClick: () => void; title?: string };

export default function ResponsiveActions({ label = '更多操作', actions }: { label?: string; actions: Action[] }) {
  return <>
    <div className="responsive-actions-inline">
      {actions.map((action) => <Button key={action.label} onClick={action.onClick} title={action.title}>{action.label}</Button>)}
    </div>
    <div className="responsive-actions-menu">
      <Dropdown>
        <Dropdown.Toggle>{label} ▾</Dropdown.Toggle>
        <Dropdown.Menu>
          {actions.map((action) => <Dropdown.Item key={action.label} onClick={action.onClick} title={action.title}>{action.label}</Dropdown.Item>)}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  </>;
}
