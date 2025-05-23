import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';

import { useBasic } from '@/hooks/use-basic';
import { getRandomInt } from '@/utils/rand.ts';

const pad2 = (num: number) => num < 10 ? '0' + num : num;
const rollNum = () => pad2(getRandomInt(1, 100));

const Roll: React.FC = () => {
    const { value, action, copy } = useBasic(rollNum().toString(), '');

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>随机数 (1-100)</Card.Title>
                <Card.Text className="font-monospace fs-1">{value}</Card.Text>
                <ButtonGroup>
                    <Button variant="light" className="border" onClick={action(() => rollNum().toString())}>Roll !</Button>
                    <Button variant="light" className="border" onClick={copy}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default Roll;
