import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { useState, useMemo } from 'react';
import { uniq } from 'lodash';

interface PriceItem {
    price: number;
    unitNum: number;
    netContent: number;
    unitPrice: number;
}

const PriceCalcPage: React.FC = () => {
    const STORAGE_NAME = 'price_calc_items';
    const CALC_PREC = 4;

    const [price, setPrice] = useState(0);
    const [unitNum, setUnitNum] = useState(1);
    const [netContent, setNetContent] = useState(100);

    const unitPrice = useMemo(() => Number(price / (unitNum * netContent)), [price, unitNum, netContent]);

    const loadPriceList = () => JSON.parse(localStorage.getItem(STORAGE_NAME) ?? '[]');

    const [priceList, setPriceList] = useState<PriceItem[]>(loadPriceList());

    const minUnitPrice = useMemo(() => Math.min(...priceList.map((item) => item.unitPrice)), [priceList]);

    const savePrice = () => setPriceList(prev => {
        const priceItem: PriceItem = { price: price, unitNum: unitNum, netContent: netContent, unitPrice: unitPrice };
        const newList = uniq([priceItem, ...prev]);
        localStorage.setItem(STORAGE_NAME, JSON.stringify(newList));
        return newList;
    });

    const cleanList = () => {
        setPriceList(() => {
            localStorage.removeItem(STORAGE_NAME);
            return [];
        })
    };

    const deletePrice = (index: number) => () => {
        setPriceList(prev => {
            const newList = prev.filter((_, i) => i !== index);
            localStorage.setItem(STORAGE_NAME, JSON.stringify(newList));
            return newList;
        });
    };


    return (
        <>
            <Card className="mt-3">
                <Card.Body>
                    <Card.Title>比价计算机</Card.Title>
                    <Form.Group className="mb-3">
                        <Form.Label>总价</Form.Label>
                        <Form.Control type="number" value={price.toString()} onChange={e => setPrice(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>份数</Form.Label>
                        <Form.Control type="number" value={unitNum.toString()} onChange={e => setUnitNum(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>净含量</Form.Label>
                        <Form.Control type="number" value={netContent.toString()} onChange={e => setNetContent(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>单价</Form.Label>
                        <Form.Control type="number" value={unitPrice.toFixed(CALC_PREC)} readOnly />
                    </Form.Group>
                    <ButtonGroup className="me-2">
                        <Button variant="light" className="border" onClick={savePrice}>储存</Button>
                        <Button variant="light" className="border" onClick={cleanList}>清空</Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
            <Card className="mt-3">
                <Card.Body>
                    <Card.Title>比价记录列表</Card.Title>
                    <Table>
                        <thead>
                            <tr>
                                <th>总价</th>
                                <th>份数</th>
                                <th>净含量</th>
                                <th>单价</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceList.map((item: PriceItem, index: number) =>
                                <tr key={index}>
                                    <td>{item.price}</td>
                                    <td>{item.unitNum}</td>
                                    <td>{item.netContent}</td>
                                    <td style={{
                                        color: item.unitPrice === minUnitPrice ? "red" : "black",
                                        fontWeight: item.unitPrice === minUnitPrice ? "bold" : "normal",
                                    }}>{item.unitPrice.toFixed(CALC_PREC)}{item.unitPrice === minUnitPrice && " (最便宜)"}</td>
                                    <td><button type="button" className="btn-close" onClick={deletePrice(index)}></button></td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
    )
}

export default PriceCalcPage
