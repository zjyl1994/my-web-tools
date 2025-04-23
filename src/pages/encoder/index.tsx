import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { Base64 } from 'js-base64';

import { useBasic } from '@/hooks/use-basic';

import { decode_oct_utf8, encode_gzip, decode_gzip } from './utils';

const EncoderPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('');

    return (
        <>
            <Form.Control 
                as="textarea" 
                rows={20} 
                spellCheck={false} 
                value={value} 
                onChange={e => setValue(e.target.value)} 
                className='scrollable-textarea'
                style={{ fontFamily: '"Lucida Console", Courier, monospace' }}
            />

            <ButtonToolbar>
                {functionButtonGroup}
            </ButtonToolbar>

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(Base64.encode)} title="原版 Base64">Base64 编码</Button>
                    <Button variant="light" className="border" onClick={action(Base64.encodeURI)} title="URL 安全版本">Base64 URL 编码</Button>
                    <Button variant="light" className="border" onClick={action(Base64.decode)} title="两种 Base64 都能解">Base64 通用解码</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(encodeURIComponent)} title="encodeURIComponent">URL 编码</Button>
                    <Button variant="light" className="border" onClick={action(decodeURIComponent)} title="decodeURIComponent">URL 解码</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(encode_gzip)} title="Gzip后编码到Base64">Gzip 编码</Button>
                    <Button variant="light" className="border" onClick={action(decode_gzip)} title="解码Base64后的Gzip">Gzip 解码</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(decode_oct_utf8)} title="解码'\123\456'这种字符串">八进制 UTF8 解码</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    );
};

export default EncoderPage
