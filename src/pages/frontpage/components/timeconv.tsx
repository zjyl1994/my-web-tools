import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import { useBasic } from '@/hooks/use-basic';
import dayjs from 'dayjs';

const nowTs = () => dayjs().unix().toString();
const timestamp2str = (ts: string) => dayjs.unix(Number(ts)).format('YYYY-MM-DD HH:mm:ss');
const str2timestamp = (value: string) => dayjs(value).unix().toString();

const TimeConv: React.FC = () => {
    const { value, setValue, action, copy, paste } = useBasic(nowTs(),'');

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>时间戳</Card.Title>
                <Card.Text className="my-2">
                    <Form.Control value={value} onChange={e => setValue(e.target.value)} />
                </Card.Text>
                <ButtonGroup>
                    <Button variant="light" className="border" onClick={action(nowTs)}>当前时间戳</Button>
                    <Button variant="light" className="border" onClick={action(timestamp2str)}>时间戳转字符串</Button>
                    <Button variant="light" className="border" onClick={action(str2timestamp)}>字符串转时间戳</Button>
                    <Button variant="light" className="border" onClick={copy}>复制</Button>
                    <Button variant="light" className="border" onClick={paste}>粘贴</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
};

export default TimeConv
