import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { useBasic } from '@/hooks/use-basic';
import { format } from 'sql-formatter';


const SQLPage: React.FC = () => {
    const { value, setValue, action, copy, paste } = useBasic('');

    return (
        <>
            <Form.Control as="textarea" rows={20} spellCheck={false} value={value} onChange={e => setValue(e.target.value)} className='scrollable-textarea' />

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(text => format(text, { language: 'mysql' }))}>格式化</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={copy}>复制</Button>
                    <Button variant="outline-primary" onClick={paste}>粘贴</Button>
                    <Button variant="outline-primary" onClick={() => setValue('')}>清空</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default SQLPage
