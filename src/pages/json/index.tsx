import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { useState } from 'react';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import JsonViewer from './components/jsonviewer.tsx';

import {
    format_json, enhanced_format_json, paste_and_format,
    compress_json, escape_json, unescape_json, is_json,
    single_quote, trim_json, multiline_trim_json, multiline_to_one, smart_process,
    python_print_to_json
} from './utils';

const JsonPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'json');
    const [showJsonViewer, setShowJsonViewer] = useState(false);

    const { rows, textareaRef } = useTextareaResize('json', 20);

    return (
        <>
            <Form.Control
                ref={textareaRef}
                as="textarea"
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
                    <Button variant="light" className="border" onClick={action(format_json)} title="格式化当前JSON">格式化</Button>
                    <Button variant="light" className="border" onClick={action(enhanced_format_json)} title="递归格式化内嵌于字符串的JSON">增强格式化</Button>
                    <Button variant="light" className="border" onClick={action(paste_and_format)} title="粘贴并进行增强格式化">粘贴 & 格式化</Button>
                    <Button variant="light" className="border" onClick={action(compress_json)} title="压缩成一行">压缩</Button>
                    <Button variant="light" className="border" onClick={action(escape_json)} title="转义为字符串">转义</Button>
                    <Button variant="light" className="border" onClick={action(unescape_json)} title="去除字符串转义">去转义</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(smart_process)} title="尝试智能处理，不一定有效">智能处理</Button>
                    <Button variant="light" className="border" onClick={action(single_quote)} title="转换单引号为双引号">单引号</Button>
                    <Button variant="light" className="border" onClick={action(trim_json)} title="去除两边非 JSON 内容">TRIM</Button>
                    <Button variant="light" className="border" onClick={action(multiline_trim_json)} title="去除每一行两边非 JSON 内容">多行 TRIM</Button>
                    <Button variant="light" className="border" onClick={action(multiline_to_one)} title="多行 JSON 转数组">多行 JSON 格式化</Button>
                    <Button variant="light" className="border" onClick={action(python_print_to_json)} title="尝试转换 Python 打印内容到 JSON 格式">Python?</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={() => setShowJsonViewer(true)} title="大文件会很卡，请耐心等待" disabled={!is_json(value)}>JSON Viewer</Button>
                </ButtonGroup>
            </ButtonToolbar>

            <div className='mt-2' style={{ color: 'rgba(0, 0, 128, .5)' }}>智能处理功能目前支持自动base64解码,gzip解压,去除两端非json内容,单双引号修复,能覆盖80%的日常场景了。</div>

            {
                showJsonViewer &&
                <JsonViewer src={value} show={showJsonViewer} onHide={() => setShowJsonViewer(false)} />
            }
        </>
    )
}

export default JsonPage
