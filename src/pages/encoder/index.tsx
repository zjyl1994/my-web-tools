import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { Base64 } from 'js-base64';

import { useBasic } from '@/hooks/use-basic';

import { decode_oct_utf8 } from './utils';

const EncoderPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('');

    return (
        <>
            <Form.Control as="textarea" rows={20} spellCheck={false} value={value} onChange={e => setValue(e.target.value)} className='scrollable-textarea' />

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(Base64.encode)}>Base64 编码</Button>
                    <Button variant="light" className="border" onClick={action(Base64.encodeURI)}>Base64 URL 编码</Button>
                    <Button variant="light" className="border" onClick={action(Base64.decode)}>Base64 通用解码</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(encodeURIComponent)}>URL 编码</Button>
                    <Button variant="light" className="border" onClick={action(decodeURIComponent)}>URL 解码</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(decode_oct_utf8)}>八进制 UTF8 解码</Button>
                </ButtonGroup>
                {functionButtonGroup}
            </ButtonToolbar>
        </>
    );
};

export default EncoderPage
