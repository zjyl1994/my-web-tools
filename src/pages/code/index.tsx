import { useState, useMemo } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

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
        <Form.Label>主密码</Form.Label>
        <Form.Control type="password" onChange={e => setMainPassword(e.target.value.trim())} autoComplete='off'/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>助记符</Form.Label>
        <Form.Control type="text" onChange={e => setRememberName(e.target.value.trim())} autoComplete='off'/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>最终密码</Form.Label>
        <Form.Control type="text" value={calcCode} readOnly />
      </Form.Group>
      <p className="font-monospace fs-2">{displayCalcCode}</p>
      <Button variant="light" className="border" onClick={copy}>复制</Button>
    </>
  )
}

export default CodePage
