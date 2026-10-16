import { Button } from '@/components/ui';
import CodeEditor from '@/components/ui/code-editor';
import EditorActions from '@/components/ui/editor-actions';
import ResponsiveActions from '@/components/ui/responsive-actions';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import {
    clean_struct_tag, add_json_struct_tag, add_gorm_column_tag,
    gen_struct_conv, clean_comment, combine_empty_line,
} from './utils';

const LazyGoPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'lazygo');

    const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('lazygo', 15);

    return (
        <>
            <CodeEditor
                ariaLabel="Go 代码"
                value={value}
                onChange={setValue}
                rows={rows}
                resizeRef={textareaRef}
            />

            <EditorActions editing={functionButtonGroup}>
                <Button variant="light" className="border" onClick={action(clean_struct_tag)}>清理结构体标签</Button>
                <Button variant="light" className="border" onClick={action(add_json_struct_tag)}>添加 JSON 标签</Button>
                <Button variant="light" className="border" onClick={action(add_gorm_column_tag)}>添加 GORM 列名</Button>
                <Button variant="light" className="border" onClick={action(gen_struct_conv)}>结构体互转</Button>
                <ResponsiveActions label="代码清理" actions={[
                    { label: '移除注释', onClick: action(clean_comment) },
                    { label: '合并空行', onClick: action(combine_empty_line) },
                ]} />
            </EditorActions>
        </>
    )
}

export default LazyGoPage;
