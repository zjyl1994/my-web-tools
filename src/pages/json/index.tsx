import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { useBasic } from '@/hooks/use-basic';

import { format_json, enhanced_format_json, compress_json } from './utils';

const JsonPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('');

    return (
        <>
            <Form.Control as="textarea" rows={20} spellCheck={false} value={value} onChange={e => setValue(e.target.value)}  className='scrollable-textarea'/>

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" onClick={action(format_json)}>格式化</Button>
                    <Button variant="light" onClick={action(enhanced_format_json)}>增强格式化</Button>
                    <Button variant="light" onClick={action(compress_json)}>压缩</Button>
                </ButtonGroup>
                {functionButtonGroup}
            </ButtonToolbar>
        </>
    )
}

export default JsonPage
