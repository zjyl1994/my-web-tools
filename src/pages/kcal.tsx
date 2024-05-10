import { useState } from 'react';
import Form from 'react-bootstrap/Form';

const Render: React.FC = () => {
  const [partEngery, setPartEngery] = useState(0);
  const [partWeight, setPartWeight] = useState(100);
  const [totalWeight, setTotalWeight] = useState(100);

  const handleChange = (setState: React.Dispatch<React.SetStateAction<number>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => setState(Number(event.target.value));

  const totalEngery = (): number => Math.round(totalWeight / partWeight * partEngery * 0.239006);

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>每份能量(千焦)</Form.Label>
        <Form.Control type="number" value={partEngery} onChange={handleChange(setPartEngery)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>每份重量</Form.Label>
        <Form.Control type="number" value={partWeight} onChange={handleChange(setPartWeight)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>总重量</Form.Label>
        <Form.Control type="number" value={totalWeight} onChange={handleChange(setTotalWeight)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>总能量(大卡)</Form.Label>
        <Form.Control type="number" value={totalEngery()} readOnly />
      </Form.Group>
    </>
  )
}

export default Render
