import { Button } from '@/components/ui';
import CodeEditor from '@/components/ui/code-editor';
import EditorActions from '@/components/ui/editor-actions';
import ResponsiveActions from '@/components/ui/responsive-actions';

import { Base64 } from 'js-base64';

import { useBasic,useTextareaResize } from '@/hooks/use-basic';

import { decode_oct_utf8, encode_gzip, decode_gzip } from './utils';

const EncoderPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('','encoder');

    const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('encoder', 20);

    return (
        <>
            <CodeEditor
                ariaLabel="待编解码的内容"
                value={value}
                onChange={setValue}
                rows={rows}
                resizeRef={textareaRef}
            />

            <EditorActions editing={functionButtonGroup}>
                <Button variant="primary" className="border" onClick={action(Base64.encode)} title="原版 Base64">Base64 编码</Button>
                <Button onClick={action(Base64.decode)}>Base64 解码</Button>
                <Button onClick={action(encodeURIComponent)}>URL 编码</Button>
                <Button onClick={action(decodeURIComponent)}>URL 解码</Button>
                <ResponsiveActions label="更多编解码" actions={[
                    { label: 'Base64 URL 编码', onClick: action(Base64.encodeURI) },
                    { label: 'Gzip 编码', onClick: action(encode_gzip) },
                    { label: 'Gzip 解码', onClick: action(decode_gzip) },
                    { label: '八进制 UTF8 解码', onClick: action(decode_oct_utf8) },
                ]} />
            </EditorActions>
        </>
    );
};

export default EncoderPage
