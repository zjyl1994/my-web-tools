import { Button } from '@/components/ui';
import CodeEditor from '@/components/ui/code-editor';
import EditorActions from '@/components/ui/editor-actions';
import ResponsiveActions from '@/components/ui/responsive-actions';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';

import {
    format_json, enhanced_format_json, paste_and_format,
    compress_json, escape_json, unescape_json,
    single_quote, trim_json, multiline_trim_json, multiline_to_one, smart_process,
    python_print_to_json
} from './utils';

const JsonPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'json');

    const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('json', 20);

    return (
        <>
            <CodeEditor
                ariaLabel="JSON 内容"
                value={value}
                onChange={setValue}
                rows={rows}
                resizeRef={textareaRef}
                language="json"
                lineWrapping
                enableLanguageHighlight
                enableLanguageFolding
            />

            <EditorActions editing={functionButtonGroup}>
                <Button variant="primary" className="border" onClick={action(format_json)} title="格式化当前JSON">格式化</Button>
                <Button variant="light" className="border" onClick={action(enhanced_format_json)} title="递归格式化内嵌于字符串的JSON">增强格式化</Button>
                <Button variant="light" className="border" onClick={action(paste_and_format)} title="粘贴并进行增强格式化">粘贴 & 格式化</Button>
                <Button variant="light" className="border" onClick={action(compress_json)} title="压缩成一行">压缩</Button>
                <ResponsiveActions label="修复与转换" actions={[
                    { label: '转义为字符串', onClick: action(escape_json) },
                    { label: '去除转义', onClick: action(unescape_json) },
                    { label: '智能修复', onClick: action(smart_process), title: '尝试解码、解压及修复 JSON' },
                    { label: '修复单引号', onClick: action(single_quote) },
                    { label: '提取 JSON', onClick: action(trim_json) },
                    { label: '逐行提取 JSON', onClick: action(multiline_trim_json) },
                    { label: '多行 JSON 转数组', onClick: action(multiline_to_one) },
                    { label: 'Python 转 JSON', onClick: action(python_print_to_json) },
                ]} />
            </EditorActions>

            <div className="ui-helper-text mt-3">智能修复可尝试 Base64 解码、Gzip 解压、提取 JSON 和修复引号。</div>
        </>
    )
}

export default JsonPage
