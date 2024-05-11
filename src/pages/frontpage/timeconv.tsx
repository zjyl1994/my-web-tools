import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import { useBasic } from '@/hooks/use-basic';

const pad2 = (num: number) => num < 10 ? '0' + num : num;

const timestamp2str = (ts: string) => {
    const date = new Date(Number(ts) * 1000);
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hour = pad2(date.getHours());
    const minute = pad2(date.getMinutes());
    const second = pad2(date.getSeconds());
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
};

const TimeConv: React.FC = () => {
    const nowTs = () => Math.floor(Date.now() / 1000).toString();

    const { value, setValue, copy } = useBasic(nowTs());

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);

    const currentTimestamp = () => setValue(nowTs());
    const formTimestamp = () => setValue(timestamp2str(value));
    const toTimestamp = () => {
        const parsedDate = new Date(value.replace(/-/g, '/'));
        const timestamp = ~~(parsedDate.getTime() / 1e3);
        setValue(timestamp.toString());
    };
    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>时间戳</Card.Title>
                <Card.Text className="my-2">
                    <Form.Control value={value} onChange={handleChange} />
                </Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={currentTimestamp}>当前时间戳</Button>
                    <Button variant="outline-primary" onClick={formTimestamp}>时间戳转字符串</Button>
                    <Button variant="outline-primary" onClick={toTimestamp}>字符串转时间戳</Button>
                    <Button variant="outline-primary" onClick={copy}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
};

export default TimeConv
