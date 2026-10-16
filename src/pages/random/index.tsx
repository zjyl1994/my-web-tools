import { useState } from 'react';
import { Button, ButtonToolbar, Form } from '@/components/ui';
import GeneratorResult from '@/components/ui/generator-result';
import { useBasic } from '@/hooks/use-basic';
import { useStoredState } from '@/hooks/use-stored-state';
import { characterGroups, generateNumbers, generateStrings, MAX_GENERATION_COUNT, MAX_STRING_LENGTH } from './utils';

type Mode = 'number' | 'string';

export default function RandomPage() {
  const [mode, setMode] = useStoredState<Mode>('random.mode', 'number');
  const [min, setMin] = useStoredState('random.min', '1');
  const [max, setMax] = useStoredState('random.max', '100');
  const [length, setLength] = useStoredState('random.length', '16');
  const [count, setCount] = useStoredState('random.count', '10');
  const [groups, setGroups] = useStoredState<string[]>('random.groups', ['lowercase', 'uppercase', 'digits']);
  const { value: result, setValue: setResult } = useBasic('', 'random');
  const [error, setError] = useState('');

  return (
    <div className="batch-generator">
      <form onSubmit={(event) => {
        event.preventDefault();
        try {
          const characters = characterGroups.filter((group) => groups.includes(group.id)).map((group) => group.characters).join('');
          setResult(mode === 'number'
            ? generateNumbers(Number(min), Number(max), Number(count))
            : generateStrings(Number(length), characters, Number(count)));
          setError('');
        } catch (err) {
          setError(err instanceof Error ? err.message : '生成失败，请重试。');
        }
      }}>
        <fieldset className="generator-mode">
          <legend>生成类型</legend>
          <ButtonToolbar>
            <Button aria-pressed={mode === 'number'} variant={mode === 'number' ? 'primary' : 'light'} onClick={() => { setMode('number'); setError(''); }}>随机整数</Button>
            <Button aria-pressed={mode === 'string'} variant={mode === 'string' ? 'primary' : 'light'} onClick={() => { setMode('string'); setError(''); }}>随机字符串</Button>
          </ButtonToolbar>
        </fieldset>
        <div className="generator-settings">
          {mode === 'number' ? <>
            <Form.Group>
              <Form.Label htmlFor="random-min">最小值（含）</Form.Label>
              <Form.Control id="random-min" type="number" step="1" required value={min} onChange={(event) => setMin(event.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="random-max">最大值（含）</Form.Label>
              <Form.Control id="random-max" type="number" step="1" required value={max} onChange={(event) => setMax(event.target.value)} />
            </Form.Group>
          </> : <Form.Group>
            <Form.Label htmlFor="random-length">字符串长度</Form.Label>
            <Form.Control id="random-length" type="number" min="1" max={MAX_STRING_LENGTH} step="1" required value={length} onChange={(event) => setLength(event.target.value)} />
          </Form.Group>}
          <Form.Group>
            <Form.Label htmlFor="random-count">生成数量</Form.Label>
            <Form.Control id="random-count" type="number" min="1" max={MAX_GENERATION_COUNT} step="1" required value={count} onChange={(event) => setCount(event.target.value)} />
          </Form.Group>
        </div>
        {mode === 'string' && <fieldset className="generator-characters">
          <legend>包含字符</legend>
          {characterGroups.map((group) => <label key={group.id}>
            <input type="checkbox" checked={groups.includes(group.id)} onChange={(event) => setGroups((current) => event.target.checked ? [...current, group.id] : current.filter((id) => id !== group.id))} />
            {group.label}
          </label>)}
        </fieldset>}
        <div className="generator-submit"><Button type="submit" variant="primary">生成</Button><span className="ui-helper-text">每次最多 {MAX_GENERATION_COUNT} 条，结果可能重复</span></div>
        {error && <p className="text-danger ui-helper-text" role="alert">{error}</p>}
      </form>
      <GeneratorResult value={result} />
    </div>
  );
}
