import { useState, useMemo } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import md5 from 'blueimp-md5';
import { sha1 } from 'js-sha1';

import { useCopy } from '@/hooks/use-basic';

const calculate = (mainPassword: string, rememberName: string) => {
  const joint = mainPassword + rememberName;
  const value = md5(joint + sha1(joint)).substring(0, 16);
  return [
    value.substring(0, 4).toUpperCase(),
    value.substring(4, 8),
    value.substring(8, 12).toUpperCase(),
    value.substring(12, 16),
  ].join('-');
};

const CodePage: React.FC = () => {
  const [mainPassword, setMainPassword] = useState('');
  const [rememberName, setRememberName] = useState('');

  const calcCode = useMemo(() => calculate(mainPassword, rememberName), [mainPassword, rememberName]);
  const copy = useCopy(calcCode);

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>主密码</Form.Label>
        <Form.Control type="password" value={mainPassword} onChange={e => setMainPassword(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>助记符</Form.Label>
        <Form.Control type="text" value={rememberName} onChange={e => setRememberName(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>最终密码</Form.Label>
        <Form.Control type="text" value={calcCode} readOnly />
      </Form.Group>
      <p className="font-monospace fs-2">{calcCode}</p>
      <Button variant="outline-primary" onClick={copy}>复制</Button>
    </>
  )
}

export default CodePage
