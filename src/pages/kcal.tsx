import { useState, ChangeEvent } from 'react';
import Form from 'react-bootstrap/Form';

const Render: React.FC = () => {
    const [calcParams, setCalcParams] = useState({
        totalWeight: 100,
        partWeight: 100,
        partEngery: 0,
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
        setCalcParams(preValue => { return { ...preValue, [event.target.name]: event.target.value } });

    const totalEngery = (): number => Math.round(calcParams.totalWeight / calcParams.partWeight * calcParams.partEngery * 0.239006);

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>每份能量(千焦)</Form.Label>
                <Form.Control type="number" value={calcParams.partEngery} onChange={handleChange} name="partEngery" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>每份重量</Form.Label>
                <Form.Control type="number" value={calcParams.partWeight} onChange={handleChange} name="partWeight" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>总重量</Form.Label>
                <Form.Control type="number" value={calcParams.totalWeight} onChange={handleChange} name="totalWeight" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>总能量(大卡)</Form.Label>
                <Form.Control type="number" value={totalEngery()} readOnly />
            </Form.Group>
        </>
    )
}

export default Render
