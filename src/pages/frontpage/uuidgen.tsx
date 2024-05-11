import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';

import { v4 as uuid } from 'uuid';

import { doCopy } from '@/utils';

const UUID: React.FC = () => {
    const [inputValue, setInputValue] = useState(uuid());

    const handleGenButton = () => setInputValue(uuid());

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>UUID</Card.Title>
                <Card.Text className="font-monospace fs-4">{inputValue}</Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={handleGenButton}>生成</Button>
                    <Button variant="outline-primary" onClick={() => doCopy(inputValue)}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default UUID
