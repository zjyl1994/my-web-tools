import { Button } from '@/components/ui';
import CodeEditor from '@/components/ui/code-editor';
import EditorActions from '@/components/ui/editor-actions';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import { format } from 'sql-formatter';


const SQLPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'sql');

    const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('sql', 20);


    return (
        <>
            <CodeEditor
                ariaLabel="SQL 内容"
                value={value}
                onChange={setValue}
                rows={rows}
                resizeRef={textareaRef}
            />

            <EditorActions editing={functionButtonGroup}>
                <Button variant="primary" className="border" onClick={action(text => format(text, { language: 'mysql' }))}>格式化</Button>
            </EditorActions>
        </>
    )
}

export default SQLPage
