import ActionError from '@/components/ui/action-error';
import { Button, Form } from '@/components/ui';
import CodeEditor from '@/components/ui/code-editor';
import EditorActions from '@/components/ui/editor-actions';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import { format, type SqlLanguage } from 'sql-formatter';
import { useStoredState } from '@/hooks/use-stored-state';

const dialects = [
    ['mysql', 'MySQL'], ['postgresql', 'PostgreSQL'], ['sqlite', 'SQLite'],
    ['transactsql', 'SQL Server'], ['mariadb', 'MariaDB'], ['plsql', 'Oracle PL/SQL'],
    ['bigquery', 'BigQuery'], ['spark', 'Spark SQL'], ['sql', '标准 SQL'],
] as const satisfies ReadonlyArray<readonly [SqlLanguage, string]>;


const SQLPage: React.FC = () => {
    const { value, setValue, action, actionError, clearActionError, functionButtonGroup } = useBasic('', 'sql', true);

    const [storedLanguage, setLanguage] = useStoredState<SqlLanguage>('sql.language', 'mysql');
    const language = dialects.find(([value]) => value === storedLanguage)?.[0] ?? 'mysql';

    const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('sql', 20);


    return (
        <>
            <Form.Group>
                <Form.Label htmlFor="sql-language">SQL 方言</Form.Label>
                <select id="sql-language" className="ui-control" value={language} aria-describedby="sql-language-help" onChange={(event) => {
                    setLanguage(event.target.value as SqlLanguage);
                    clearActionError();
                }}>
                    {dialects.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <p id="sql-language-help" className="ui-helper-text">选择 SQL 使用的数据库方言；解析失败时，请确认方言与语句一致。</p>
            </Form.Group>
            <CodeEditor
                ariaLabel="SQL 内容"
                value={value}
                onChange={setValue}
                rows={rows}
                resizeRef={textareaRef}
            />

            <ActionError message={actionError} />

            <EditorActions editing={functionButtonGroup}>
                <Button variant="primary" className="border" onClick={action(text => format(text, { language }))}>格式化</Button>
            </EditorActions>
        </>
    )
}

export default SQLPage
