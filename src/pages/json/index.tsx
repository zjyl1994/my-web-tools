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
                    <Button variant="light" className="border" onClick={action(format_json)} title="格式化当前JSON">格式化</Button>
                    <Button variant="light" className="border" onClick={action(enhanced_format_json)} title="递归格式化内嵌于字符串的JSON">增强格式化</Button>
                    <Button variant="light" className="border" onClick={action(compress_json)} title="压缩成一行">压缩</Button>
                </ButtonGroup>
                {functionButtonGroup}
            </ButtonToolbar>
        </>
    )
}

export default JsonPage
