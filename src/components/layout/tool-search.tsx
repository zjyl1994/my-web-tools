import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui';
import ToolIcon from './tool-icon';
import { tools } from './tools';

export default function ToolSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const navigate = useNavigate();
  const search = query.trim().toLowerCase();
  const matches = tools.filter((tool) => `${tool.title} ${tool.description} ${tool.group} ${tool.path}`.toLowerCase().includes(search));

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
        setActiveIndex(0);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function close() { setOpen(false); setQuery(''); setActiveIndex(0); }

  function openTool(path: string) {
    navigate(path);
    close();
  }

  function focusResult(index: number) {
    const next = Math.min(Math.max(index, 0), matches.length - 1);
    if (!matches.length) return;
    setActiveIndex(next);
    resultRefs.current[next]?.focus();
  }

  return <>
    <button type="button" className="tool-search-trigger" aria-label="搜索工具" aria-keyshortcuts="Control+k Meta+k" onClick={() => { setActiveIndex(0); setOpen(true); }}>
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
              <Form.Control
                ref={input}
                type="search"
                aria-label="工具名称或用途"
                placeholder="输入工具名称或用途…"
                aria-describedby="tool-search-count"
                value={query}
                autoComplete="off"
                onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && matches[activeIndex]) {
                    event.preventDefault();
                    openTool(matches[activeIndex].path);
                  }
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    focusResult(0);
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    focusResult(matches.length - 1);
                  }
                }}
              />
              <p className="ui-helper-text" id="tool-search-count" role="status">{matches.length ? `${matches.length} 个匹配工具` : '没有找到匹配的工具，换个关键词试试。'}</p>
              <ul className="tool-search-results">
                {matches.map((tool, index) => (
                  <li key={tool.path}>
                    <Link
                      ref={(node) => { resultRefs.current[index] = node; }}
                      to={tool.path}
                      onClick={close}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowDown') { event.preventDefault(); focusResult(index + 1); }
                        if (event.key === 'ArrowUp') {
                          event.preventDefault();
                          if (index === 0) input.current?.focus(); else focusResult(index - 1);
                        }
                      }}
                      className={index === activeIndex ? 'is-active' : undefined}
                    >
                      <ToolIcon name={tool.icon} /><span><strong>{tool.title}</strong><small>{tool.group}</small></span><ToolIcon name="arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
