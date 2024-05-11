import { useState, ChangeEvent } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import md5 from 'blueimp-md5';
import { sha1 } from 'js-sha1';

const Render: React.FC = () => {
  const [calcParams, setCalcParams] = useState({
    mainPassword: '',
    rememberName: '',
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setCalcParams(preValue => { return { ...preValue, [event.target.name]: event.target.value } });

  const calcCode = (): string => {
    const value = md5(calcParams.mainPassword + calcParams.rememberName + sha1(calcParams.mainPassword + calcParams.rememberName)).substring(0, 16);
    return value.substring(0, 4).toUpperCase() + value.substring(4, 8) + value.substring(8, 12).toUpperCase() + value.substring(12, 16);
  };
  const addSeparator = (str: string, separator: string, n: number): string => {
    const regex = new RegExp(`.{1,${n}}`, 'g');
    return str.match(regex)?.join(separator) || str;
  }
  const doCopy = () => navigator.clipboard.writeText(calcCode()).catch(err => console.error(err));

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>主密码</Form.Label>
        <Form.Control type="password" value={calcParams.mainPassword} onChange={handleChange} name="mainPassword" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>助记符</Form.Label>
        <Form.Control type="text" value={calcParams.rememberName} onChange={handleChange} name="rememberName" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>最终密码</Form.Label>
        <Form.Control type="text" value={calcCode()} readOnly />
      </Form.Group>
      <p className="font-monospace fs-2">{addSeparator(calcCode(),'-',4)}</p>
      <Button variant="outline-primary" onClick={doCopy}>复制</Button>
    </>
  )
}

export default Render
