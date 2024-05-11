import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import { doCopy } from '@/utils';

function timestamp2str(ts: string) {
    let pad2 = (num: number) => num < 10 ? '0' + num : num;
    let date = new Date(Number(ts) * 1000);
    let year = date.getFullYear();
    let month = pad2(date.getMonth() + 1);
    let day = pad2(date.getDate());
    let hour = pad2(date.getHours());
    let minute = pad2(date.getMinutes());
    let second = pad2(date.getSeconds());
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

const TimeConv: React.FC = () => {
    const nowTs = () => Math.floor(Date.now() / 1000).toString();

    const [inputValue, setInputValue] = useState(nowTs());

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value);

    const currentTimestamp = () => setInputValue(nowTs());
    const formTimestamp = () => setInputValue(timestamp2str(inputValue));
    const toTimestamp = () => {
        let parsedDate = new Date(inputValue.replace(/-/g, '/'));
        let timestamp = ~~(parsedDate.getTime() / 1e3);
        setInputValue(timestamp.toString());
    }
    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>时间戳</Card.Title>
                <Card.Text className="my-2">
                    <Form.Control value={inputValue} onChange={handleChange} />
                </Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={currentTimestamp}>当前时间戳</Button>
                    <Button variant="outline-primary" onClick={formTimestamp}>时间戳转字符串</Button>
                    <Button variant="outline-primary" onClick={toTimestamp}>字符串转时间戳</Button>
                    <Button variant="outline-primary" onClick={() => doCopy(inputValue)}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default TimeConv
