import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import { useBasic } from '@/hooks/use-basic';
import { superLottoGen, markSixGen } from './utils.ts';
import { useState } from 'react';
import { uniq } from 'lodash';

const LotteryGen: React.FC = () => {
    const [codeList, setCodeList] = useState<string[]>([])
    const { value, action } = useBasic(superLottoGen());
    const saveCode = () => setCodeList(prev => uniq([value, ...prev]));
    const cleanList = () => setCodeList([]);

    return (
        <>
            <Card className="mt-3">
                <Card.Body>
                    <Card.Title>彩票选号机</Card.Title>
                    <Card.Text className="font-monospace fs-5">{value}</Card.Text>
                    <ButtonGroup className="me-2">
                        <Button variant="outline-primary" onClick={action(superLottoGen)}>生成 大乐透</Button>
                        <Button variant="outline-primary" onClick={action(markSixGen)}>生成 六合彩</Button>
                    </ButtonGroup>
                    <ButtonGroup className="me-2">
                        <Button variant="outline-primary" onClick={saveCode}>储存</Button>
                        <Button variant="outline-primary" onClick={cleanList}>清空</Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
            <Card className="mt-3">
                <Card.Header>心仪号码列表</Card.Header>
                <ListGroup variant="flush">
                    {codeList.map((item: string) => <ListGroup.Item>{item}</ListGroup.Item>)}
                </ListGroup>
            </Card>

        </>
    )
}

export default LotteryGen
