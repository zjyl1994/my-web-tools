import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui';
import ToolIcon from './tool-icon';
import { tools } from './tools';

export default function ToolSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const search = query.trim().toLowerCase();
  const matches = tools.filter((tool) => `${tool.title} ${tool.description} ${tool.group} ${tool.path}`.toLowerCase().includes(search));

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function close() { setOpen(false); setQuery(''); }

  return <>
    <button type="button" className="tool-search-trigger" aria-label="搜索工具" aria-keyshortcuts="Control+k Meta+k" onClick={() => setOpen(true)}>
      <ToolIcon name="search" /><span>搜索工具</span><kbd>Ctrl / ⌘ K</kbd>
    </button>
    <Dialog.Root open={open} onOpenChange={(next) => { if (next) setOpen(true); else close(); }}>
      <Dialog.Portal>
        <div className="ui-dialog-layer">
          <Dialog.Backdrop className="ui-dialog-backdrop" />
          <Dialog.Popup className="ui-dialog-popup tool-search-popup" initialFocus={input}>
            <div className="ui-dialog__header">
              <Dialog.Title className="ui-dialog__title">搜索工具</Dialog.Title>
              <Dialog.Close className="ui-close-button" aria-label="关闭搜索">×</Dialog.Close>
            </div>
            <div className="tool-search-body">
              <Form.Control ref={input} type="search" aria-label="工具名称或用途" placeholder="输入工具名称或用途…" value={query} autoComplete="off" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
                if (event.key === 'Enter' && matches[0]) { event.preventDefault(); navigate(matches[0].path); close(); }
                if (event.key === 'ArrowDown') { event.preventDefault(); document.querySelector<HTMLAnchorElement>('.tool-search-results a')?.focus(); }
              }} />
              <p className="ui-helper-text" role="status">{matches.length ? `${matches.length} 个匹配工具` : '没有找到匹配的工具，换个关键词试试。'}</p>
              <ul className="tool-search-results">
                {matches.map((tool) => <li key={tool.path}><Link to={tool.path} onClick={close}><ToolIcon name={tool.icon} /><span><strong>{tool.title}</strong><small>{tool.group}</small></span><ToolIcon name="arrow" /></Link></li>)}
              </ul>
            </div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
