import { Button, ButtonGroup, ButtonToolbar } from '@/components/ui';
import CodeEditor from '@/components/ui/code-editor';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import { format } from 'sql-formatter';


const SQLPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'sql');

    const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('sql', 20);


    return (
        <>
            <CodeEditor
                value={value}
                onChange={setValue}
                rows={rows}
                resizeRef={textareaRef}
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
