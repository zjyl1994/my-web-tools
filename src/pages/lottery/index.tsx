import EditorActions from '@/components/ui/editor-actions';
import { Button, Card, ListGroup } from '@/components/ui';

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
        <div className="records-layout">
            <Card className="mt-3">
                <Card.Body>
                    <Card.Title>随机选号</Card.Title>
                    <Card.Text className="lottery-result font-monospace fs-5">{value}</Card.Text>
                    <EditorActions editing={<>
                        <Button onClick={saveCode}>收藏号码</Button>
                        <Button onClick={cleanList}>清空收藏</Button>
                    </>}>
                        <Button variant="primary" onClick={action(superLottoGen)}>生成大乐透</Button>
                        <Button onClick={action(markSixGen)}>生成六合彩</Button>
                    </EditorActions>
                </Card.Body>
            </Card>
            <Card className="mt-3">
                <Card.Header>已保存的号码</Card.Header>
                <ListGroup variant="flush">
                    {codeList.length === 0 && <ListGroup.Item className="empty-records">还没有收藏的号码，生成一组试试。</ListGroup.Item>}
                    {codeList.map((item: string, index: number) =>
                        <ListGroup.Item key={item} className="d-flex justify-content-between">
                            <div>{item} </div>
                            <button type="button" className="btn-close" aria-label="删除这组号码" onClick={deleteCode(index)}></button>
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </Card>

        </div>
    )
}

export default LotteryGen
