import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import * as LosslessJSON from 'lossless-json'

import { useBasic } from '@/hooks/use-basic';

const deepParse = (s: string): unknown => LosslessJSON.parse(s, (_, v) => {
    try {
        return typeof v === 'string' && !/^\d+$/.test(v) ? deepParse(v) : v;
    } catch {
        return v;
    }
});
const format_json = (data: string) => LosslessJSON.stringify(LosslessJSON.parse(data), null, 4)!;
const enhanced_format_json = (data: string) => LosslessJSON.stringify(deepParse(data), null, 4)!;
const compress_json = (data: string) => LosslessJSON.stringify(LosslessJSON.parse(data))!;

const Render: React.FC = () => {
    const { value, setValue, action, copy, paste } = useBasic('');

    return (
        <>
            <Form.Control as="textarea" rows={20} spellCheck={false} value={value} onChange={e => setValue(e.target.value)} />

            <ButtonToolbar className="mt-2">
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(format_json)}>格式化</Button>
                    <Button variant="outline-primary" onClick={action(enhanced_format_json)}>增强格式化</Button>
                    <Button variant="outline-primary" onClick={action(compress_json)}>压缩</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={copy}>复制</Button>
                    <Button variant="outline-primary" onClick={paste}>粘贴</Button>
                    <Button variant="outline-primary" onClick={() => setValue('')}>清空</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default Render
