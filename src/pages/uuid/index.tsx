import ControlGroup from '@/components/ui/control-group';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button, Form } from '@/components/ui';
import GeneratorResult from '@/components/ui/generator-result';
import { useBasic } from '@/hooks/use-basic';
import { useStoredState } from '@/hooks/use-stored-state';
import { MAX_GENERATION_COUNT, generationCountError } from '@/pages/random/utils';

const generate = (count: number) => Array.from({ length: count }, () => uuid()).join('\n');

export default function UuidPage() {
  const [count, setCount] = useStoredState('uuid.count', '10');
  const { value: result, setValue: setResult } = useBasic('', 'uuid');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const countError = generationCountError(count);

  return (
    <div className="batch-generator">
      <form noValidate onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        setError('');
        if (countError) {
          event.currentTarget.querySelector<HTMLInputElement>('#uuid-count')?.focus();
          return;
        }
        try {
          const nextCount = Number(count);
          setResult(generate(nextCount));
          setError('');
        } catch (err) {
          setError(err instanceof Error ? err.message : '生成失败，请重试。');
        }
      }}>
        <div className="generator-settings generator-settings--uuid">
          <Form.Group>
            <ControlGroup label="数量" htmlFor="uuid-count">
              <Form.Control id="uuid-count" type="number" min="1" max={MAX_GENERATION_COUNT} step="1" required value={count} onChange={(event) => setCount(event.target.value)} aria-invalid={submitted && Boolean(countError)} aria-describedby={submitted && countError ? 'uuid-count-error' : undefined} />
            </ControlGroup>
            {submitted && countError && <p id="uuid-count-error" className="ui-field-error" aria-live="polite">{countError}</p>}
          </Form.Group>
          <Button type="submit" variant="primary">生成 UUID</Button>
        </div>
        <p className="ui-helper-text">UUID v4 · 每次最多 {MAX_GENERATION_COUNT} 条</p>
        {error && <p className="ui-field-error" role="alert">{error}</p>}
      </form>
      <GeneratorResult value={result} />
    </div>
  );
}
