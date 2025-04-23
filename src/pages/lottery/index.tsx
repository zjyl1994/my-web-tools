import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import { useBasic } from '@/hooks/use-basic';
import { superLottoGen, markSixGen } from './utils.ts';
import { useState } from 'react';
import { uniq } from 'lodash';

const LotteryGen: React.FC = () => {
    const loadCodeList = () => JSON.parse(localStorage.getItem("lottery_codes") ?? '[]');

    const [codeList, setCodeList] = useState<string[]>(loadCodeList())
    const { value, action } = useBasic(superLottoGen(), '');

    const saveCode = () => setCodeList(prev => {
        const newList = uniq([value, ...prev]);
        localStorage.setItem("lottery_codes", JSON.stringify(newList));
        return newList;
    });

    const cleanList = () => {
        if (confirm('真的要清空吗?'))
            setCodeList(() => {
                localStorage.removeItem("lottery_codes");
                return [];
            })
    };

    const deleteCode = (index: number) => () => {
        if (confirm('真的要删除吗?'))
            setCodeList(prev => {
                const newList = prev.filter((_, i) => i !== index);
                localStorage.setItem("lottery_codes", JSON.stringify(newList));
                return newList;
            });
    };

    return (
        <>
            <Card className="mt-3">
                <Card.Body>
                    <Card.Title>彩票选号机</Card.Title>
                    <Card.Text className="font-monospace fs-5">{value}</Card.Text>
                    <ButtonGroup className="me-2">
                        <Button variant="light" className="border" onClick={action(superLottoGen)}>生成 大乐透</Button>
                        <Button variant="light" className="border" onClick={action(markSixGen)}>生成 六合彩</Button>
                    </ButtonGroup>
                    <ButtonGroup className="me-2">
                        <Button variant="light" className="border" onClick={saveCode}>储存</Button>
                        <Button variant="light" className="border" onClick={cleanList}>清空</Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
            <Card className="mt-3">
                <Card.Header>心仪号码列表</Card.Header>
                <ListGroup variant="flush">
                    {codeList.map((item: string, index: number) =>
                        <ListGroup.Item className="d-flex justify-content-between">
                            <div>{item} </div>
                            <button type="button" className="btn-close" onClick={deleteCode(index)}></button>
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </Card>

        </>
    )
}

export default LotteryGen
