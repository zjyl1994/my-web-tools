import EditorActions from '@/components/ui/editor-actions';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { Button, Card, Form, InputGroup } from '@/components/ui';
import CopyButton from '@/components/ui/copy-button';
import BatchQRCode from './batch';

type QRTemplate = 'text' | 'url' | 'wifi' | 'vcard' | 'phone' | 'sms' | 'email';
type QRErrorLevel = 'L' | 'M' | 'Q' | 'H';

type QRTemplateState = {
    text: { content: string };
    url: { value: string };
    wifi: { ssid: string; password: string; security: 'WPA' | 'WEP' | 'nopass'; hidden: boolean };
    vcard: {
        firstName: string;
        lastName: string;
        organization: string;
        title: string;
        phone: string;
        email: string;
        website: string;
        address: string;
        note: string;
    };
    phone: { number: string };
    sms: { number: string; message: string };
    email: { to: string; subject: string; body: string };
};

const templateOptions: Array<{ value: QRTemplate | 'batch'; label: string; helper: string }> = [
    { value: 'text', label: '文本', helper: '适合普通文本、口令和短消息。' },
    { value: 'batch', label: '批量', helper: '输入全部文本，按行或段落自动批量生成二维码。' },
    { value: 'url', label: '网址', helper: '扫码后直接打开网页或应用落地页。' },
    { value: 'wifi', label: 'WiFi', helper: '扫码加入无线网络。' },
    { value: 'vcard', label: '名片', helper: '生成联系人名片二维码，便于通讯录导入。' },
    { value: 'phone', label: '电话', helper: '扫码后直接拨打电话。' },
    { value: 'sms', label: '短信', helper: '扫码后预填号码和短信内容。' },
    { value: 'email', label: '邮件', helper: '扫码后预填收件人、主题和正文。' },
];

const defaultTemplateState: QRTemplateState = {
    text: { content: 'Hello QRCode' },
    url: { value: 'https://example.com' },
    wifi: { ssid: 'MyWiFi', password: '12345678', security: 'WPA', hidden: false },
    vcard: {
        firstName: '三',
        lastName: '张',
        organization: 'OpenAI',
        title: '工程师',
        phone: '13800138000',
        email: 'demo@example.com',
        website: 'https://example.com',
        address: '北京市朝阳区',
        note: '很高兴认识你',
    },
    phone: { number: '13800138000' },
    sms: { number: '13800138000', message: '你好，请联系我。' },
    email: { to: 'demo@example.com', subject: 'Hello', body: 'Hi there' },
};

const BarcodePage: React.FC = () => {
    const [template, setTemplate] = useState<QRTemplate | 'batch'>('text');
    const [templateState, setTemplateState] = useState<QRTemplateState>(defaultTemplateState);
    const [width, setWidth] = useState('360');
    const [errorLevel, setErrorLevel] = useState<QRErrorLevel>('M');
    const [rendering, setLoading] = useState(false);
    const [renderError, setRenderError] = useState('');
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [svgMarkup, setSvgMarkup] = useState('');

    const templateHelper = useMemo(
        () => templateOptions.find((item) => item.value === template)?.helper ?? '',
        [template],
    );

    const payload = useMemo(() => template === 'batch' ? '' : buildPayload(template, templateState), [template, templateState]);
    const request = useMemo(() => ({ payload, width, errorLevel }), [payload, width, errorLevel]);
    const [activeRequest, setActiveRequest] = useState<typeof request | null>(null);
    const waiting = !!payload.trim() && activeRequest !== request;
    const loading = waiting || rendering;

    useEffect(() => {
        let cancelled = false;
        const { payload, width, errorLevel } = request;

        const renderCode = async () => {
            const text = payload.trim();
            setActiveRequest(request);
            setLoading(true);
            setRenderError('');
            setImageDataUrl('');
            setSvgMarkup('');

            if (!text) {
                setLoading(false);
                return;
            }

            const safeWidth = getSafeWidth(width);

            try {
                const [pngDataUrl, svgText] = await Promise.all([
                    renderQRCodePng(text, safeWidth, errorLevel),
                    renderQRCodeSvg(text, safeWidth, errorLevel),
                ]);

                if (cancelled) {
                    return;
                }

                setImageDataUrl(pngDataUrl);
                setSvgMarkup(svgText);
            } catch (error) {
                if (cancelled) {
                    return;
                }
                console.error(error);
                const message = '二维码生成失败：内容可能过长或包含无法编码的字符。请缩短内容或降低纠错等级。';
                setRenderError(message);
                toast.error(message, { autoClose: 8000 });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(renderCode, 800);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [request]);

    const updateTemplateField = <T extends QRTemplate, K extends keyof QRTemplateState[T]>(
        nextTemplate: T,
        key: K,
        value: QRTemplateState[T][K],
    ) => {
        setTemplateState((current) => ({
            ...current,
            [nextTemplate]: {
                ...current[nextTemplate],
                [key]: value,
            } as QRTemplateState[T],
        }));
    };

    const resetCurrentTemplate = () => {
        if (template === 'batch') return;
        setTemplateState((current) => ({
            ...current,
            [template]: { ...defaultTemplateState[template] },
        }));
    };

    const downloadPng = () => {
        if (!imageDataUrl) {
            return;
        }
        triggerDownload(imageDataUrl, `qrcode-${template}-${Date.now()}.png`);
    };

    const downloadSvg = () => {
        if (!svgMarkup) {
            return;
        }
        const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `qrcode-${template}-${Date.now()}.svg`);
        setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    const renderTemplateFields = () => {
        const current = templateState;

        switch (template) {
            case 'text':
                return (
                    <Form.Group>
                        <Form.Label htmlFor="barcode-field-1">文本内容</Form.Label>
                        <Form.Control id="barcode-field-1"
                            as="textarea"
                            rows={6}
                            spellCheck={false}
                            value={current.text.content}
                            onChange={(e) => updateTemplateField('text', 'content', e.target.value)}
                            className="scrollable-textarea textarea-font"
                            placeholder="输入文本内容"
                        />
                    </Form.Group>
                );
            case 'url':
                return (
                    <Form.Group>
                        <Form.Label htmlFor="barcode-field-2">网址</Form.Label>
                        <Form.Control id="barcode-field-2"
                            type="url"
                            value={current.url.value}
                            onChange={(e) => updateTemplateField('url', 'value', e.target.value)}
                            placeholder="https://example.com"
                        />
                    </Form.Group>
                );
            case 'wifi':
                return (
                    <>
                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-3">WiFi 名称</Form.Label>
                                <Form.Control id="barcode-field-3"
                                    value={current.wifi.ssid}
                                    onChange={(e) => updateTemplateField('wifi', 'ssid', e.target.value)}
                                    placeholder="MyWiFi"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-4">加密方式</Form.Label>
                                <select id="barcode-field-4"
                                    className="ui-control"
                                    value={current.wifi.security}
                                    onChange={(e) => updateTemplateField('wifi', 'security', e.target.value as QRTemplateState['wifi']['security'])}
                                >
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">无密码</option>
                                </select>
                            </Form.Group>
                        </div>
                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-5">密码</Form.Label>
                                <Form.Control id="barcode-field-5"
                                    type="text"
                                    value={current.wifi.password}
                                    onChange={(e) => updateTemplateField('wifi', 'password', e.target.value)}
                                    placeholder="12345678"
                                    disabled={current.wifi.security === 'nopass'}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>隐藏网络</Form.Label>
                                <label className="barcode-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={current.wifi.hidden}
                                        onChange={(e) => updateTemplateField('wifi', 'hidden', e.target.checked)}
                                    />
                                    <span>扫码时标记为隐藏网络</span>
                                </label>
                            </Form.Group>
                        </div>
                    </>
                );
            case 'vcard':
                return (
                    <>
                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-6">姓</Form.Label>
                                <Form.Control id="barcode-field-6"
                                    value={current.vcard.lastName}
                                    onChange={(e) => updateTemplateField('vcard', 'lastName', e.target.value)}
                                    placeholder="张"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-7">名</Form.Label>
                                <Form.Control id="barcode-field-7"
                                    value={current.vcard.firstName}
                                    onChange={(e) => updateTemplateField('vcard', 'firstName', e.target.value)}
                                    placeholder="三"
                                />
                            </Form.Group>
                        </div>
                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-8">公司</Form.Label>
                                <Form.Control id="barcode-field-8"
                                    value={current.vcard.organization}
                                    onChange={(e) => updateTemplateField('vcard', 'organization', e.target.value)}
                                    placeholder="OpenAI"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-9">职位</Form.Label>
                                <Form.Control id="barcode-field-9"
                                    value={current.vcard.title}
                                    onChange={(e) => updateTemplateField('vcard', 'title', e.target.value)}
                                    placeholder="工程师"
                                />
                            </Form.Group>
                        </div>
                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-10">电话</Form.Label>
                                <Form.Control id="barcode-field-10"
                                    value={current.vcard.phone}
                                    onChange={(e) => updateTemplateField('vcard', 'phone', e.target.value)}
                                    placeholder="13800138000"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="barcode-field-11">邮箱</Form.Label>
                                <Form.Control id="barcode-field-11"
                                    type="email"
                                    value={current.vcard.email}
                                    onChange={(e) => updateTemplateField('vcard', 'email', e.target.value)}
                                    placeholder="demo@example.com"
                                />
                            </Form.Group>
                        </div>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-12">网址</Form.Label>
                            <Form.Control id="barcode-field-12"
                                type="url"
                                value={current.vcard.website}
                                onChange={(e) => updateTemplateField('vcard', 'website', e.target.value)}
                                placeholder="https://example.com"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-13">地址</Form.Label>
                            <Form.Control id="barcode-field-13"
                                value={current.vcard.address}
                                onChange={(e) => updateTemplateField('vcard', 'address', e.target.value)}
                                placeholder="北京市朝阳区"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-14">备注</Form.Label>
                            <Form.Control id="barcode-field-14"
                                as="textarea"
                                rows={4}
                                spellCheck={false}
                                value={current.vcard.note}
                                onChange={(e) => updateTemplateField('vcard', 'note', e.target.value)}
                                className="scrollable-textarea textarea-font"
                                placeholder="备注信息"
                            />
                        </Form.Group>
                    </>
                );
            case 'phone':
                return (
                    <Form.Group>
                        <Form.Label htmlFor="barcode-field-15">电话号码</Form.Label>
                        <Form.Control id="barcode-field-15"
                            value={current.phone.number}
                            onChange={(e) => updateTemplateField('phone', 'number', e.target.value)}
                            placeholder="13800138000"
                        />
                    </Form.Group>
                );
            case 'sms':
                return (
                    <>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-16">手机号</Form.Label>
                            <Form.Control id="barcode-field-16"
                                value={current.sms.number}
                                onChange={(e) => updateTemplateField('sms', 'number', e.target.value)}
                                placeholder="13800138000"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-17">短信内容</Form.Label>
                            <Form.Control id="barcode-field-17"
                                as="textarea"
                                rows={4}
                                spellCheck={false}
                                value={current.sms.message}
                                onChange={(e) => updateTemplateField('sms', 'message', e.target.value)}
                                className="scrollable-textarea textarea-font"
                                placeholder="你好，请联系我。"
                            />
                        </Form.Group>
                    </>
                );
            case 'email':
                return (
                    <>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-18">收件人</Form.Label>
                            <Form.Control id="barcode-field-18"
                                type="email"
                                value={current.email.to}
                                onChange={(e) => updateTemplateField('email', 'to', e.target.value)}
                                placeholder="demo@example.com"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-19">主题</Form.Label>
                            <Form.Control id="barcode-field-19"
                                value={current.email.subject}
                                onChange={(e) => updateTemplateField('email', 'subject', e.target.value)}
                                placeholder="Hello"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-20">正文</Form.Label>
                            <Form.Control id="barcode-field-20"
                                as="textarea"
                                rows={4}
                                spellCheck={false}
                                value={current.email.body}
                                onChange={(e) => updateTemplateField('email', 'body', e.target.value)}
                                className="scrollable-textarea textarea-font"
                                placeholder="Hi there"
                            />
                        </Form.Group>
                    </>
                );
        }
    };

    const templateSelector = (
        <Form.Group>
            <div className="ui-label" id="qrcode-template-label">模板</div>
            <div className="barcode-kind-switcher" role="group" aria-labelledby="qrcode-template-label">
                {templateOptions.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        className={`barcode-kind-switcher__item${item.value === template ? ' is-active' : ''}`}
                        aria-pressed={item.value === template}
                        onClick={() => setTemplate(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div className="barcode-helper-text">{templateHelper}</div>
        </Form.Group>
    );
    const settings = (
        <div className="barcode-grid">
            <Form.Group>
                <Form.Label htmlFor="barcode-field-21">目标宽度</Form.Label>
                <InputGroup className="ui-input-group--suffix">
                    <Form.Control id="barcode-field-21"
                        inputMode="numeric"
                        value={width}
                        onChange={(e) => setWidth(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="360"
                        aria-describedby="barcode-width-unit"
                    />
                    <InputGroup.Text id="barcode-width-unit">px</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group>
                <Form.Label htmlFor="barcode-field-22">纠错等级</Form.Label>
                <select id="barcode-field-22"
                    className="ui-control"
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as QRErrorLevel)}
                >
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="Q">Q</option>
                    <option value="H">H</option>
                </select>
            </Form.Group>
        </div>
    );

    if (template === 'batch') {
        return <BatchQRCode templateSelector={templateSelector} settings={settings} width={getSafeWidth(width)} errorLevel={errorLevel} />;
    }

    return (
        <div className="barcode-page">
            <div className="barcode-page__layout">
                <Card className="barcode-page__panel">
                    <Card.Header>内容与样式</Card.Header>
                    <Card.Body>
                        {templateSelector}

                        {renderTemplateFields()}

                        {settings}

                        <Form.Group>
                            <Form.Label htmlFor="barcode-field-23">编码内容</Form.Label>
                            <Form.Control id="barcode-field-23"
                                as="textarea"
                                rows={6}
                                readOnly
                                spellCheck={false}
                                value={payload}
                                className="scrollable-textarea textarea-font"
                            />
                        </Form.Group>

                        <EditorActions editing={<>
                            <CopyButton text={payload} label="复制内容" disabled={!payload.trim()} />
                            <Button onClick={resetCurrentTemplate}>重置模板</Button>
                        </>}>
                            <Button variant="primary" onClick={downloadPng} disabled={loading || !imageDataUrl}>下载 PNG</Button>
                            <Button onClick={downloadSvg} disabled={loading || !svgMarkup}>下载 SVG</Button>
                        </EditorActions>
                    </Card.Body>
                </Card>

                <Card className="barcode-page__preview">
                    <Card.Header>预览</Card.Header>
                    <Card.Body>
                        <div className="barcode-preview-shell">
                            {svgMarkup ? <div className="barcode-preview-svg" dangerouslySetInnerHTML={{ __html: svgMarkup }} /> : null}
                        </div>
                        <div className="barcode-status-row">
                            <span>{waiting ? '等待输入完成…' : loading ? '正在生成…' : `当前模板：${templateOptions.find((item) => item.value === template)?.label}`}</span>
                            <span>SVG 预览 + PNG/SVG 下载</span>
                        </div>
                        {renderError ? <div className="barcode-error-text">{renderError}</div> : null}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

const renderQRCodePng = async (
    text: string,
    width: number,
    errorCorrectionLevel: QRErrorLevel,
) => {
    return QRCode.toDataURL(text, {
        width,
        margin: 1,
        errorCorrectionLevel,
        color: {
            dark: '#0f172a',
            light: '#ffffffff',
        },
    });
};

const renderQRCodeSvg = async (
    text: string,
    width: number,
    errorCorrectionLevel: QRErrorLevel,
) => {
    return QRCode.toString(text, {
        type: 'svg',
        width,
        margin: 1,
        errorCorrectionLevel,
        color: {
            dark: '#0f172a',
            light: '#ffffffff',
        },
    });
};

const buildPayload = (template: QRTemplate, state: QRTemplateState) => {
    switch (template) {
        case 'text':
            return state.text.content;
        case 'url':
            return state.url.value.trim();
        case 'wifi':
            return buildWifiPayload(state.wifi);
        case 'vcard':
            return buildVCardPayload(state.vcard);
        case 'phone':
            return state.phone.number.trim() ? `TEL:${state.phone.number.trim()}` : '';
        case 'sms':
            return buildSmsPayload(state.sms.number, state.sms.message);
        case 'email':
            return buildMailPayload(state.email.to, state.email.subject, state.email.body);
    }
};

const buildWifiPayload = (wifi: QRTemplateState['wifi']) => {
    const security = wifi.security === 'nopass' ? 'nopass' : wifi.security;
    const password = wifi.security === 'nopass' ? '' : escapeWifiValue(wifi.password);
    const hidden = wifi.hidden ? 'true' : 'false';

    return [
        'WIFI:',
        `T:${security};`,
        `S:${escapeWifiValue(wifi.ssid)};`,
        `P:${password};`,
        `H:${hidden};`,
        ';',
    ].join('');
};

const buildVCardPayload = (card: QRTemplateState['vcard']) => {
    const fullName = [card.lastName.trim(), card.firstName.trim()].filter(Boolean).join('') || card.organization.trim() || '联系人';
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCardValue(card.lastName)};${escapeVCardValue(card.firstName)};;;`,
        `FN:${escapeVCardValue(fullName)}`,
    ];

    pushIfValue(lines, 'ORG', card.organization);
    pushIfValue(lines, 'TITLE', card.title);
    pushIfValue(lines, 'TEL;TYPE=CELL', card.phone);
    pushIfValue(lines, 'EMAIL', card.email);
    pushIfValue(lines, 'URL', card.website);
    pushIfValue(lines, 'ADR', `;;${escapeVCardValue(card.address)};;;;`);
    pushIfValue(lines, 'NOTE', card.note);
    lines.push('END:VCARD');
    return lines.join('\n');
};

const buildSmsPayload = (number: string, message: string) => {
    const trimmedNumber = number.trim();
    const trimmedMessage = message.trim();
    if (!trimmedNumber && !trimmedMessage) {
        return '';
    }
    return `SMSTO:${trimmedNumber}:${trimmedMessage}`;
};

const buildMailPayload = (to: string, subject: string, body: string) => {
    const recipient = to.trim();
    if (!recipient && !subject.trim() && !body.trim()) {
        return '';
    }

    const query = new URLSearchParams();
    if (subject.trim()) {
        query.set('subject', subject);
    }
    if (body.trim()) {
        query.set('body', body);
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return `mailto:${recipient}${suffix}`;
};

const pushIfValue = (lines: string[], key: string, value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
        lines.push(`${key}:${escapeVCardValue(trimmedValue)}`);
    }
};

const escapeWifiValue = (value: string) => value.replace(/([\\;,:\"])/g, '\\$1');

const escapeVCardValue = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

const getSafeWidth = (width: string) => {
    const size = Number(width);
    return Number.isFinite(size) && size > 0 ? Math.round(size) : 360;
};

const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export default BarcodePage;
