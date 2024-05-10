import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';

import { v4 as uuid } from 'uuid';

const UUID: React.FC = () => {
    const [inputValue, setInputValue] = useState(uuid());

    const handleGenButton = () => setInputValue(uuid());
    const doCopy = () => navigator.clipboard.writeText(inputValue).catch(err => console.error(err));

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>UUID</Card.Title>
                <Card.Text className="font-monospace fs-4">{inputValue}</Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={handleGenButton}>生成</Button>
                    <Button variant="outline-primary" onClick={doCopy}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default UUID
