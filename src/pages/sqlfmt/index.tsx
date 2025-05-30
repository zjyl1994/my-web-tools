import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import { format } from 'sql-formatter';


const SQLPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'sql');

    const { rows, textareaRef } = useTextareaResize('sql', 20);


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
                    <Button variant="light" className="border" onClick={action(text => format(text, { language: 'mysql' }))}>格式化</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default SQLPage
