import { useState } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import * as LosslessJSON from 'lossless-json'

const Render: React.FC = () => {
    const deepParse: any = (s: string) => LosslessJSON.parse(s, (_, v) => {
        try {
            return typeof v === 'string' && !/^\d+$/.test(v) ? deepParse(v) : v;
        } catch {
            return v;
        }
    });
    const format_json = (data: any) => LosslessJSON.stringify(LosslessJSON.parse(data), null, 4);
    const compress_json = (data: any) => LosslessJSON.stringify(LosslessJSON.parse(data));
    const enhanced_format_json = (data: any) => LosslessJSON.stringify(deepParse(data), null, 4);

    const [inputValue, setInputValue] = useState('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value);
    const doAction = (action: Function) => {
        return () => {
            try {
                const result = action(inputValue);
                if (result) setInputValue(result);
            } catch (e) { console.error(e) };
        }
    }
    const doCopy = () => navigator.clipboard.writeText(inputValue).catch(err => console.error(err));
    const doPaste = () => navigator.clipboard.readText().then(text => setInputValue(text)).catch(err => console.error(err));

    return (
        <>
            <Form.Control as="textarea" rows={20} spellCheck={false} value={inputValue} onChange={handleChange} />

            <ButtonToolbar className="mt-2">
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={doAction(format_json)}>格式化</Button>
                    <Button variant="outline-primary" onClick={doAction(enhanced_format_json)}>增强格式化</Button>
                    <Button variant="outline-primary" onClick={doAction(compress_json)}>压缩</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={doCopy}>复制</Button>
                    <Button variant="outline-primary" onClick={doPaste}>粘贴</Button>
                    <Button variant="outline-primary" onClick={() => { setInputValue("") }}>清空</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default Render
