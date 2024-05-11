import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';

import { v4 as uuid } from 'uuid';

import { useBasic } from '@/hooks/use-basic';

const Uuid: React.FC = () => {
    const { value, action, copy } = useBasic(uuid());

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>UUID</Card.Title>
                <Card.Text className="font-monospace fs-4">{value}</Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={action(() => uuid())}>生成</Button>
                    <Button variant="outline-primary" onClick={copy}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default Uuid;
