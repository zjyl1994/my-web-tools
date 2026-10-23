import ControlGroup from '@/components/ui/control-group';
import { useEffect, useRef } from 'react';
import ActionError from '@/components/ui/action-error';
import { Button } from '@/components/ui';
import CodeEditor from '@/components/ui/code-editor';
import EditorActions from '@/components/ui/editor-actions';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import { format } from 'sql-formatter';
import { detectDialect, dialects, MAX_DETECTION_LENGTH, type DialectChoice } from './dialect';
import './style.css';
import { useStoredState } from '@/hooks/use-stored-state';

const SQLPage: React.FC = () => {
    const { value, setValue, action, actionError, clearActionError, functionButtonGroup } = useBasic('', 'sql', true);

    const [storedLanguage, setLanguage] = useStoredState<DialectChoice>('sql.language', 'auto');
    const choice = storedLanguage === 'auto' || dialects.some(([value]) => value === storedLanguage) ? storedLanguage : 'auto';
    const detectionCache = useRef<{ sample: string; language: ReturnType<typeof detectDialect>['language'] } | null>(null);

    useEffect(() => {
        if (choice !== 'auto') return;
        const timer = window.setTimeout(() => {
            const sample = value.slice(0, MAX_DETECTION_LENGTH);
            if (detectionCache.current?.sample !== sample) {
                detectionCache.current = { sample, language: detectDialect(sample).language };
            }
        }, 250);
        return () => window.clearTimeout(timer);
    }, [value, choice]);

    function formatSql(text: string) {
        if (choice !== 'auto') return format(text, { language: choice });
        const sample = text.slice(0, MAX_DETECTION_LENGTH);
        // Clicking before the debounce finishes must use the current input.
        if (detectionCache.current?.sample !== sample) {
            detectionCache.current = { sample, language: detectDialect(sample).language };
        }
        return format(text, { language: detectionCache.current.language });
    }

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

            <ActionError message={actionError} />

            <EditorActions editing={functionButtonGroup}>
                <div className="sql-format-controls">
                    <Button variant="primary" className="border" onClick={() => action(formatSql)()}>格式化</Button>
                    <ControlGroup label="方言" htmlFor="sql-language" compact>
                        <select id="sql-language" className="ui-control" value={choice} onChange={(event) => {
                            setLanguage(event.target.value as DialectChoice);
                            clearActionError();
                        }}>
                            <option value="auto">自动检测</option>
                            {dialects.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </ControlGroup>
                </div>
            </EditorActions>
        </>
    )
}

export default SQLPage
