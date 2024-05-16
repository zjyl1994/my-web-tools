import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';

import { useBasic } from '@/hooks/use-basic';

const rollNum = () => Math.floor(Math.random() * 100) + 1;

const Roll: React.FC = () => {
    const { value, action, copy } = useBasic(rollNum().toString());

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>Roll</Card.Title>
                <Card.Text className="font-monospace fs-1">{value}</Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={action(() => rollNum().toString())}>生成</Button>
                    <Button variant="outline-primary" onClick={copy}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default Roll;
