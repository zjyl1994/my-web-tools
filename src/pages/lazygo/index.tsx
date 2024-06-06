import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { useBasic } from '@/hooks/use-basic';
import {
    clean_struct_tag, add_json_struct_tag, add_gorm_column_tag,
    append_struct_conv,
} from './utils';

const LazyGoPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('');
    return (
        <>
            <Form.Control as="textarea" rows={15} spellCheck={false} value={value} onChange={e => setValue(e.target.value)} className='scrollable-textarea' />

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(clean_struct_tag)}>清理结构体标签</Button>
                    <Button variant="light" className="border" onClick={action(add_json_struct_tag)}>添加 JSON 标签</Button>
                    <Button variant="light" className="border" onClick={action(add_gorm_column_tag)}>添加 GORM 列名</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(append_struct_conv)}>生成两结构体互转代码</Button>
                </ButtonGroup>
                {functionButtonGroup}
            </ButtonToolbar>
        </>
    )
}

export default LazyGoPage;
