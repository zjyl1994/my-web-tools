import ControlGroup from '@/components/ui/control-group';
import { useEffect, useState } from 'react';
import { Button, ButtonToolbar, Card, Form } from '@/components/ui';
import CopyButton from '@/components/ui/copy-button';
import { useStoredState } from '@/hooks/use-stored-state';
import { convertInput, formatDatetime, formatOffset, parseDatetime, parseTimestamp } from './utils';
import type { TimestampUnit, TimeZone } from './utils';
import './style.css';

function CopyValue({ id, label, value, placeholder = '等待输入' }: { id: string; label: string; value: string; placeholder?: string }) {
  return <div className="timestamp-output">
    <Form.Label htmlFor={id}>{label}</Form.Label>
    <ControlGroup end={<CopyButton text={value} disabled={!value} ariaLabel={`复制${label}`} />}>
      <Form.Control id={id} className="font-monospace" value={value} placeholder={placeholder} readOnly />
    </ControlGroup>
  </div>;
}

export default function TimestampPage() {
  const [now, setNow] = useState(Date.now);
  const [zone, setZone] = useStoredState<TimeZone>('timestamp.zone', 'local');
  const [unit, setUnit] = useStoredState<TimestampUnit>('timestamp.unit', 'auto');
  const [timestamp, setTimestamp] = useStoredState('timestamp.input', '');
  const [datetime, setDatetime] = useStoredState('timestamp.datetime', '');
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timestampConversion = convertInput(() => parseTimestamp(timestamp, unit));
  const datetimeConversion = convertInput(() => parseDatetime(datetime, zone));
  const parsedTimestamp = timestampConversion.result;
  const parsedDatetime = datetimeConversion.result;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentValues = <div className="timestamp-current-values">
    <div><span>秒</span><code>{Math.floor(now / 1000)}</code><CopyButton text={String(Math.floor(now / 1000))} label="复制秒" ariaLabel="复制当前秒时间戳" /></div>
    <div><span>毫秒</span><code>{now}</code><CopyButton text={String(now)} label="复制毫秒" ariaLabel="复制当前毫秒时间戳" /></div>
  </div>;

  return (
    <div className="timestamp-page">
      <div className="timestamp-current">
        <div><span className="ui-helper-text">当前时间</span><div className="timestamp-live font-monospace">{formatDatetime(now, zone).slice(0, -4)}</div></div>
        <div className="timestamp-current-desktop">{currentValues}</div>
        <details className="timestamp-current-mobile"><summary>复制时间戳</summary>{currentValues}</details>
      </div>
      <div className="timestamp-zone">
        <ControlGroup label="转换时区" htmlFor="timestamp-zone" compact>
          <select id="timestamp-zone" className="ui-control" value={zone} onChange={(event) => setZone(event.target.value as TimeZone)}>
            <option value="local">本地时区 · {localZone}</option>
            <option value="utc">UTC · 协调世界时</option>
          </select>
        </ControlGroup>
        <span className="ui-helper-text">Unix 时间戳本身不带时区</span>
      </div>
      <div className="timestamp-converters">
        <Card>
          <Card.Header><h2>时间戳 → 日期时间</h2></Card.Header>
          <Card.Body>
            <div className="timestamp-input-heading"><Form.Label htmlFor="timestamp-input">Unix 时间戳</Form.Label></div>
            <ControlGroup end={
              <select aria-label="时间戳单位" className="ui-control" value={unit} onChange={(event) => setUnit(event.target.value as TimestampUnit)}>
                <option value="auto">自动识别</option><option value="seconds">秒（s）</option><option value="milliseconds">毫秒（ms）</option>
              </select>
            }>
              <Form.Control id="timestamp-input" className="font-monospace" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} placeholder="例如 1700000000 或 1700000000000" aria-invalid={Boolean(timestampConversion.error)} aria-describedby="timestamp-input-help" autoComplete="off" spellCheck={false} />
            </ControlGroup>
            <p id="timestamp-input-help" className={`ui-helper-text${timestampConversion.error ? ' text-danger' : ''}`} aria-live="polite">{timestampConversion.error || (parsedTimestamp ? `当前按${parsedTimestamp.unit === 'seconds' ? '秒' : '毫秒'}解析 · ${formatOffset(parsedTimestamp.milliseconds, zone)}` : '支持秒或毫秒；较早日期建议手动指定单位。')}</p>
            <ButtonToolbar><Button onClick={() => { const value = Date.now(); setTimestamp(String(unit === 'milliseconds' ? value : Math.floor(value / 1000))); }}>填入当前时间</Button><Button disabled={!timestamp} onClick={() => setTimestamp('')}>清空</Button></ButtonToolbar>
            <div className="timestamp-results">
              <CopyValue id="timestamp-date-result" label={`日期时间（${zone === 'utc' ? 'UTC' : '本地'}）`} value={parsedTimestamp ? formatDatetime(parsedTimestamp.milliseconds, zone) : ''} />
              <CopyValue id="timestamp-iso-result" label="ISO 8601（UTC）" value={parsedTimestamp ? new Date(parsedTimestamp.milliseconds).toISOString() : ''} />
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header><h2>日期时间 → 时间戳</h2></Card.Header>
          <Card.Body>
            <div className="timestamp-input-heading"><Form.Label htmlFor="datetime-input">日期时间</Form.Label></div>
            <Form.Control id="datetime-input" className="font-monospace" value={datetime} onChange={(event) => setDatetime(event.target.value)} placeholder="YYYY-MM-DD HH:mm:ss.SSS" aria-invalid={Boolean(datetimeConversion.error)} aria-describedby="datetime-input-help" autoComplete="off" spellCheck={false} />
            <p id="datetime-input-help" className={`ui-helper-text${datetimeConversion.error ? ' text-danger' : ''}`} aria-live="polite">{datetimeConversion.error || '输入后实时转换；可省略时分秒，或粘贴带时区的 ISO 日期。'}</p>
            <ButtonToolbar><Button onClick={() => setDatetime(formatDatetime(Date.now(), zone))}>填入当前时间</Button><Button disabled={!datetime} onClick={() => setDatetime('')}>清空</Button></ButtonToolbar>
            <div className="timestamp-results">
              <CopyValue id="datetime-seconds-result" label="秒时间戳（s）" value={parsedDatetime !== null ? String(Math.floor(parsedDatetime / 1000)) : ''} />
              <CopyValue id="datetime-milliseconds-result" label="毫秒时间戳（ms）" value={parsedDatetime !== null ? String(parsedDatetime) : ''} />
            </div>
          </Card.Body>
        </Card>
      </div>
      <p className="timestamp-note ui-helper-text">未注明时区的日期按所选时区解析；带 Z 或 ±HH:mm 的 ISO 日期使用自身时区。秒时间戳向下取整，毫秒时间戳保留完整精度。</p>
    </div>
  );
}
