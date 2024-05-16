import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { useBasic } from '@/hooks/use-basic';
import {
    split_by_comma, join_with_comma,
    trim_line_space,remove_empty_line,
    add_quote, remove_quote,
    add_comma_suffix, remove_comma_suffix,
} from './utils';


const TextProcPage: React.FC = () => {
    const { value, setValue, action, copy, paste } = useBasic('');

    return (
        <>
            <Form.Control as="textarea" rows={20} spellCheck={false} value={value} onChange={e => setValue(e.target.value)} />

            <ButtonToolbar className="mt-2">
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(split_by_comma)}>逗号切行</Button>
                    <Button variant="outline-primary" onClick={action(join_with_comma)}>逗号合行</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(remove_quote)}>去引号</Button>
                    <Button variant="outline-primary" onClick={action(add_quote)}>加引号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(add_comma_suffix)}>行尾加逗号</Button>
                    <Button variant="outline-primary" onClick={action(remove_comma_suffix)}>行尾去逗号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(trim_line_space)}>去除两边空白</Button>
                    <Button variant="outline-primary" onClick={action(remove_empty_line)}>去除空行</Button>
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

export default TextProcPage
