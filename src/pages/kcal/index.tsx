import { useState, useMemo } from 'react';
import Form from 'react-bootstrap/Form';

const KcalPage: React.FC = () => {
    const [totalWeight, setTotalWeight] = useState(100);
    const [partWeight, setPartWeight] = useState(100);
    const [partEnergy, setPartEnergy] = useState(0);

    const totalEnergy = useMemo(() => Math.round(totalWeight / partWeight * partEnergy * 0.239006), [totalWeight, partWeight, partEnergy]);

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>每份能量(千焦)</Form.Label>
                <Form.Control type="number" value={partEnergy} onChange={e => setPartEnergy(Number(e.target.value))} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>每份重量</Form.Label>
                <Form.Control type="number" value={partWeight} onChange={e => setPartWeight(Number(e.target.value))} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>总重量</Form.Label>
                <Form.Control type="number" value={totalWeight} onChange={e => setTotalWeight(Number(e.target.value))} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>总能量(大卡)</Form.Label>
                <Form.Control type="number" value={totalEnergy} readOnly />
            </Form.Group>
        </>
    )
}

export default KcalPage
