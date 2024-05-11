import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import { useBasic } from '@/hooks/use-basic';

const nowTs = () => Math.floor(Date.now() / 1000).toString();

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

const str2timestamp = (value: string) => {
    const parsedDate = new Date(value.replace(/-/g, '/'));
    const timestamp = ~~(parsedDate.getTime() / 1e3);
    return timestamp.toString();
};

const TimeConv: React.FC = () => {
    const { value, setValue, action, copy } = useBasic(nowTs());

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>时间戳</Card.Title>
                <Card.Text className="my-2">
                    <Form.Control value={value} onChange={e => setValue(e.target.value)} />
                </Card.Text>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={action(nowTs)}>当前时间戳</Button>
                    <Button variant="outline-primary" onClick={action(timestamp2str)}>时间戳转字符串</Button>
                    <Button variant="outline-primary" onClick={action(str2timestamp)}>字符串转时间戳</Button>
                    <Button variant="outline-primary" onClick={copy}>复制</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
};

export default TimeConv
