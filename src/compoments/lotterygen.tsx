import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';

function getRandomNumbers(maxNumber: number, numberCount: number): number[] {
    const numbers: number[] = [];
    while (numbers.length < numberCount) {
        const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    return numbers.sort((a, b) => a - b);
}

const superLottoGen = () => {
    return getRandomNumbers(35, 5).join(' ') + ' + ' + getRandomNumbers(12, 2).join(' ')
}

const markSixGen = () => {
    return getRandomNumbers(49, 6).join(' + ');
}

const LotteryGen: React.FC = () => {
    const [inputValue, setInputValue] = useState(superLottoGen());

    const handleGenButton = (action: Function) => () => setInputValue(action());
    const doCopy = () => navigator.clipboard.writeText(inputValue).catch(err => console.error(err));

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>LotteryGen</Card.Title>
                <Card.Text className="font-monospace fs-4">{inputValue}</Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={handleGenButton(superLottoGen)}>SuperLotto</Button>
                    <Button variant="outline-primary" onClick={handleGenButton(markSixGen)}>MarkSix</Button>
                    <Button variant="outline-primary" onClick={doCopy}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default LotteryGen
