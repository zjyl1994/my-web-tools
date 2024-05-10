import { useState } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { Base64 } from 'js-base64';

const Render: React.FC = () => {
    const decode_oct_utf8 = (content:string) => {
        const byteArray = content.split('\\').filter(Boolean).map(octal => parseInt(octal, 8));
        const uint8Array = new Uint8Array(byteArray);
        const textDecoder = new TextDecoder('utf-8');
        return textDecoder.decode(uint8Array);
    }

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
                    <Button variant="outline-primary" onClick={doAction(Base64.encode)}>Base64 编码</Button>
                    <Button variant="outline-primary" onClick={doAction(Base64.encodeURI)}>Base64 URL 编码</Button>
                    <Button variant="outline-primary" onClick={doAction(Base64.decode)}>Base64 通用解码</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={doAction(encodeURIComponent)}>URL 编码</Button>
                    <Button variant="outline-primary" onClick={doAction(decodeURIComponent)}>URL 解码</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={doAction(decode_oct_utf8)}>八进制 UTF8 解码</Button>
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
