import { useId, useState } from 'react';
import { ButtonToolbar, Form } from '@/components/ui';
import CopyButton from '@/components/ui/copy-button';

export default function GeneratorResult({ value }: { value: string }) {
  const id = useId();
  const [selection, setSelection] = useState({ value: '', text: '' });
  const selectedText = selection.value === value ? selection.text : '';
  const count = value ? value.split('\n').length : 0;

  return (
    <div className="generator-result">
      <div className="generator-result-heading"><Form.Label htmlFor={id}>生成结果</Form.Label><span>{count} 条 · 每行一条</span></div>
      <Form.Control
        id={id}
        as="textarea"
        className="ui-result-field generator-result-text"
        rows={12}
        value={value}
        readOnly
        placeholder="点击生成按钮后，结果将显示在这里"
        spellCheck={false}
        wrap="off"
        onSelect={(event) => {
          const { value: text, selectionStart, selectionEnd } = event.currentTarget;
          setSelection({ value: text, text: text.slice(selectionStart, selectionEnd) });
        }}
      />
      <div className="generator-result-actions">
        <ButtonToolbar>
          <CopyButton text={value} label="复制全部" disabled={!value} />
          <CopyButton text={selectedText} label="复制选中" disabled={!selectedText} />
        </ButtonToolbar>
        <span className="ui-helper-text">可选中部分内容复制</span>
      </div>
    </div>
  );
}
