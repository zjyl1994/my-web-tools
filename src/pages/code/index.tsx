import { useState, useMemo } from 'react';

import { Form, Button } from '@/components/ui';

import { useCopy } from '@/hooks/use-basic';

import { addSeparator, calculate } from './utils';

const CodePage: React.FC = () => {
  const [mainPassword, setMainPassword] = useState('');
  const [rememberName, setRememberName] = useState('');

  const calcCode = useMemo(() => calculate(mainPassword, rememberName), [mainPassword, rememberName]);
  const displayCalcCode = useMemo(() => addSeparator(calcCode, ' '), [calcCode]);
  const copy = useCopy(calcCode);

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="code-field-1">主密码</Form.Label>
        <Form.Control id="code-field-1" type="password" onChange={e => setMainPassword(e.target.value.trim())} autoComplete='off'/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="code-field-2">助记符</Form.Label>
        <Form.Control id="code-field-2" type="text" onChange={e => setRememberName(e.target.value.trim())} autoComplete='off'/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="code-field-3">最终密码</Form.Label>
        <Form.Control id="code-field-3" type="text" value={calcCode} readOnly />
      </Form.Group>
      <p className="password-result font-monospace fs-2">{displayCalcCode}</p>
      <Button variant="primary" onClick={copy}>复制密码</Button>
    </>
  )
}

export default CodePage
