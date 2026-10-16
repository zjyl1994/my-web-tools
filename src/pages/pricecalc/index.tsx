import { useState } from 'react';
import EditorActions from '@/components/ui/editor-actions';
import { Button, Card, Form, Table } from '@/components/ui';
import { numericInput } from '@/utils/numeric-input';

interface PriceItem {
  price: number;
  unitNum: number;
  netContent: number;
  unitPrice: number;
}

const STORAGE_NAME = 'price_calc_items';
const CALC_PREC = 4;

function readPriceList(): PriceItem[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_NAME) ?? '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter((item): item is PriceItem => Boolean(item)
      && [item.price, item.unitNum, item.netContent, item.unitPrice].every((value) => typeof value === 'number' && Number.isFinite(value))
      && item.price >= 0 && item.netContent > 0 && Number.isSafeInteger(item.unitNum) && item.unitNum > 0 && item.unitPrice >= 0);
  } catch {
    return [];
  }
}

export default function PriceCalcPage() {
  const [price, setPrice] = useState('0');
  const [unitNum, setUnitNum] = useState('1');
  const [netContent, setNetContent] = useState('100');
  const [priceList, setPriceList] = useState<PriceItem[]>(readPriceList);
  const priceInput = numericInput(price, '总价');
  const quantity = numericInput(unitNum, '份数', { positive: true, integer: true });
  const content = numericInput(netContent, '每份净含量', { positive: true });
  const divisor = quantity.value !== null && content.value !== null ? quantity.value * content.value : null;
  const raw = priceInput.value !== null && divisor !== null ? priceInput.value / divisor : null;
  const unitPrice = raw !== null && Number.isFinite(raw) && Number.isFinite(divisor) && divisor !== 0 ? raw : null;
  const minUnitPrice = Math.min(...priceList.map((item) => item.unitPrice));

  function updateList(next: PriceItem[]) {
    setPriceList(next);
    localStorage.setItem(STORAGE_NAME, JSON.stringify(next));
  }

  function savePrice() {
    if (unitPrice === null || priceInput.value === null || quantity.value === null || content.value === null) return;
    updateList([{ price: priceInput.value, unitNum: quantity.value, netContent: content.value, unitPrice }, ...priceList]);
  }

  const fields = [
    { id: 'price-total', label: '总价（元）', value: price, setValue: setPrice, error: priceInput.error, step: 'any', min: '0' },
    { id: 'price-quantity', label: '份数', value: unitNum, setValue: setUnitNum, error: quantity.error, step: '1', min: '1' },
    { id: 'price-content', label: '每份净含量', value: netContent, setValue: setNetContent, error: content.error, step: 'any', min: '0' },
  ];

  return (
    <div className="records-layout">
      <Card>
        <Card.Body>
          <Card.Title>商品信息</Card.Title>
          <p className="ui-helper-text">比较不同商品时，请统一净含量单位，例如都使用 g 或 mL。</p>
          {fields.map((field) => <Form.Group key={field.id}>
            <Form.Label htmlFor={field.id}>{field.label}</Form.Label>
            <Form.Control id={field.id} type="number" min={field.min} step={field.step} value={field.value} onChange={(event) => field.setValue(event.target.value)} aria-invalid={Boolean(field.error)} aria-describedby={field.error ? `${field.id}-error` : undefined} />
            {field.error && <p id={`${field.id}-error`} className="ui-field-error" aria-live="polite">{field.error}</p>}
          </Form.Group>)}
          <Form.Group>
            <Form.Label htmlFor="price-result">单价（元 / 单位净含量）</Form.Label>
            <Form.Control id="price-result" value={unitPrice === null ? '' : unitPrice.toFixed(CALC_PREC)} placeholder="等待有效输入" readOnly />
            {raw !== null && unitPrice === null && <p className="ui-field-error" role="alert">数值超出可计算范围，请调整输入。</p>}
          </Form.Group>
          <EditorActions editing={<Button disabled={!priceList.length} onClick={() => updateList([])}>清空记录</Button>}>
            <Button variant="primary" disabled={unitPrice === null} onClick={savePrice}>保存记录</Button>
          </EditorActions>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Card.Title>比价记录列表</Card.Title>
          <Table>
            <thead><tr><th>总价</th><th>份数</th><th>净含量</th><th>单价</th><th aria-label="操作" /></tr></thead>
            <tbody>
              {priceList.length === 0 && <tr><td colSpan={5} className="empty-records">还没有比价记录，填入商品信息后保存。</td></tr>}
              {priceList.map((item, index) => <tr key={index}>
                <td>{item.price}</td><td>{item.unitNum}</td><td>{item.netContent}</td>
                <td className={item.unitPrice === minUnitPrice ? 'best-price' : undefined}>{item.unitPrice.toFixed(CALC_PREC)}{item.unitPrice === minUnitPrice && '（最便宜）'}</td>
                <td><button type="button" className="btn-close" aria-label="删除这条比价记录" onClick={() => updateList(priceList.filter((_, itemIndex) => itemIndex !== index))} /></td>
              </tr>)}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
