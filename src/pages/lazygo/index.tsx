import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import {
    clean_struct_tag, add_json_struct_tag, add_gorm_column_tag,
    gen_struct_conv, clean_comment, combine_empty_line,
} from './utils';

const LazyGoPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'lazygo');

    const { rows, textareaRef } = useTextareaResize('lazygo_rows', 15);

    return (
        <>
            <Form.Control
                as="textarea"
                ref={textareaRef}
                rows={rows}
                spellCheck={false}
                value={value}
                onChange={e => setValue(e.target.value)}
                className='scrollable-textarea textarea-font'
            />

            <ButtonToolbar>
                {functionButtonGroup}
            </ButtonToolbar>

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(clean_struct_tag)}>清理结构体标签</Button>
                    <Button variant="light" className="border" onClick={action(add_json_struct_tag)}>添加 JSON 标签</Button>
                    <Button variant="light" className="border" onClick={action(add_gorm_column_tag)}>添加 GORM 列名</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(gen_struct_conv)}>结构体互转</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(clean_comment)}>移除注释</Button>
                    <Button variant="light" className="border" onClick={action(combine_empty_line)}>合并空行</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default LazyGoPage;
