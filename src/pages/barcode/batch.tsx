import ControlGroup from '@/components/ui/control-group';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import ToolIcon from '@/components/layout/tool-icon';
import { Button, Card, Form, Modal } from '@/components/ui';

type SplitMode = 'line' | 'paragraph';
type BatchResult = { number: number; url: string; error: string };

type BatchQRCodeProps = {
    templateSelector: ReactNode;
    settings: ReactNode;
    width: number;
    errorLevel: 'L' | 'M' | 'Q' | 'H';
};

export default function BatchQRCode({ templateSelector, settings, width, errorLevel }: BatchQRCodeProps) {
    const [content, setContent] = useState('');
    const [splitMode, setSplitMode] = useState<SplitMode>('line');
    const [rendered, setRendered] = useState<{
        parts: string[]; width: number; errorLevel: string; items: BatchResult[]; complete: boolean;
    } | null>(null);
    const [expandedNumber, setExpandedNumber] = useState<number | null>(null);
    const [packing, setPacking] = useState(false);
    const parts = useMemo(() => {
        const normalized = content.replace(/\r\n?/g, '\n');
        const separator = splitMode === 'line' ? /\n/ : /\n(?:[^\S\n]*\n)+/;
        return normalized.split(separator).map((part) => part.trim()).filter(Boolean);
    }, [content, splitMode]);
    const current = rendered?.parts === parts && rendered.width === width && rendered.errorLevel === errorLevel ? rendered : null;
    const results = current?.items ?? [];
    const loading = parts.length > 0 && !current?.complete;
    const expanded = results.find((item) => item.number === expandedNumber);

    useEffect(() => {
        let cancelled = false;
        // Debounce input and yield between images so large batches remain interruptible.
        const timer = setTimeout(async () => {
            setExpandedNumber(null);
            const nextResults: BatchResult[] = [];
            let lastPreviewUpdate = 0;
            for (const [index, text] of parts.entries()) {
                if (cancelled) return;
                try {
                    const url = await QRCode.toDataURL(text, {
                        width,
                        margin: 1,
                        errorCorrectionLevel: errorLevel,
                        color: { dark: '#0f172a', light: '#ffffffff' },
                    });
                    nextResults.push({ number: index + 1, url, error: '' });
                } catch {
                    nextResults.push({ number: index + 1, url: '', error: '生成失败，请缩短该项内容或降低纠错等级。' });
                }
                if (cancelled) return;
                const now = performance.now();
                if (index === 0 || now - lastPreviewUpdate >= 50) {
                    setRendered({ parts, width, errorLevel, items: [...nextResults], complete: false });
                    lastPreviewUpdate = now;
                }
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
            if (!cancelled) setRendered({ parts, width, errorLevel, items: nextResults, complete: true });
        }, 800);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [parts, width, errorLevel]);

    const download = (item: { url: string; filename: string }) => {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.filename;
        // Keep the tool open even if the host handles this as a navigation.
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.hidden = true;
        link.addEventListener('click', (event) => event.stopPropagation());
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const downloadAll = async () => {
        if (loading || packing || !results.some((item) => item.url)) return;
        setPacking(true);
        try {
            const { createPngZip } = await import('./zip');
            const archive = createPngZip(results);
            const url = URL.createObjectURL(new Blob([archive], { type: 'application/zip' }));
            try {
                download({ url, filename: 'qrcodes.zip' });
            } finally {
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } catch {
            toast.error('ZIP 打包失败，请重试。');
        } finally {
            setPacking(false);
        }
    };

    const downloadButton = (item: BatchResult) => (
        <Button className="barcode-batch-download" onClick={() => download({ url: item.url, filename: `${item.number}.png` })}
            aria-label={`下载 ${item.number}.png`} title={`下载 ${item.number}.png`}>
            <ToolIcon name="download" />
        </Button>
    );

    return (
        <div className="barcode-page barcode-batch-page">
            <Card>
                <Card.Header>内容与样式</Card.Header>
                <Card.Body>
                    {templateSelector}
                    <Form.Group>
                        <Form.Label htmlFor="barcode-batch-content">批量文本</Form.Label>
                        <Form.Control
                            id="barcode-batch-content"
                            as="textarea"
                            rows={10}
                            spellCheck={false}
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            className="scrollable-textarea textarea-font"
                            placeholder="输入或粘贴全部内容，按所选切割方式自动生成二维码"
                        />
                    </Form.Group>
                    <Form.Group>
                        <ControlGroup label="切割方式" htmlFor="barcode-batch-split">
                            <select id="barcode-batch-split" className="ui-control" value={splitMode}
                                onChange={(event) => setSplitMode(event.target.value as SplitMode)}>
                                <option value="line">按行切割</option>
                                <option value="paragraph">按段落切割</option>
                            </select>
                        </ControlGroup>
                        <div className="barcode-helper-text">
                            {splitMode === 'line' ? '每个非空行生成一个二维码。' : '一个或多个空白行分隔段落，保留段落内的换行。'}
                        </div>
                    </Form.Group>
                    {settings}
                </Card.Body>
            </Card>
            <Card>
                <Card.Header className="barcode-batch-header">
                    <span className="barcode-batch-heading">
                        生成结果
                        <span className="barcode-batch-status" role="status">
                            {loading ? !current ? '等待输入完成…' : `正在生成 ${results.length} / ${parts.length}…` : `${parts.length} 个`}
                            {results.some((item) => item.error) ? ' · 部分生成失败' : ''}
                        </span>
                    </span>
                    <Button onClick={downloadAll} disabled={loading || packing || !results.some((item) => item.url)}
                        title="将所有成功生成的 PNG 按顺序打包下载">
                        <ToolIcon name="download" />
                        {packing ? '正在打包…' : '下载全部 ZIP'}
                    </Button>
                </Card.Header>
                <Card.Body>
                    {!parts.length ? <div className="empty-records">输入文本后，将在这里按顺序预览二维码。</div> : null}
                    <div className="barcode-batch-grid">
                        {results.map((item) => (
                            <div key={item.number} className="barcode-batch-item">
                                {item.url ? (
                                    <button type="button" className="barcode-batch-thumbnail"
                                        aria-label={`放大第 ${item.number} 个二维码`} onClick={() => setExpandedNumber(item.number)}>
                                        <img src={item.url} alt={`二维码 ${item.number}`} />
                                    </button>
                                ) : <div className="barcode-error-text" role="alert">{item.error}</div>}
                                <div className="barcode-batch-item-footer">
                                    <span className="barcode-batch-filename">{item.number}.png</span>
                                    {item.url ? downloadButton(item) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
            <Modal show={!!expanded?.url} onHide={() => setExpandedNumber(null)}>
                <Modal.Header closeButton><Modal.Title>{expandedNumber}.png</Modal.Title></Modal.Header>
                <Modal.Body>
                    {expanded?.url ? <div className="barcode-batch-expanded">
                        <img src={expanded.url} alt={`二维码 ${expanded.number}`} />
                        {downloadButton(expanded)}
                    </div> : null}
                </Modal.Body>
            </Modal>
        </div>
    );
}
