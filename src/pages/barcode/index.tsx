import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, ButtonGroup, ButtonToolbar, Card, Form, InputGroup } from '@/components/ui';
import { useCopy } from '@/hooks/use-basic';

type QRTemplate = 'text' | 'url' | 'wifi' | 'vcard' | 'phone' | 'sms' | 'email';
type QRErrorLevel = 'L' | 'M' | 'Q' | 'H';
type QRCodeModule = typeof import('qrcode');

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

const templateOptions: Array<{ value: QRTemplate; label: string; helper: string }> = [
    { value: 'text', label: '文本', helper: '适合普通文本、口令和短消息。' },
    { value: 'url', label: '网址', helper: '扫码后直接打开网页或应用落地页。' },
    { value: 'wifi', label: 'WiFi', helper: '扫码快速加入无线网络。' },
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

const loadQRCodeModule = () => import('qrcode');

const BarcodePage: React.FC = () => {
    const [template, setTemplate] = useState<QRTemplate>('text');
    const [templateState, setTemplateState] = useState<QRTemplateState>(defaultTemplateState);
    const [width, setWidth] = useState('360');
    const [errorLevel, setErrorLevel] = useState<QRErrorLevel>('M');
    const [loading, setLoading] = useState(false);
    const [renderError, setRenderError] = useState('');
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [svgMarkup, setSvgMarkup] = useState('');

    const templateHelper = useMemo(
        () => templateOptions.find((item) => item.value === template)?.helper ?? '',
        [template],
    );

    const payload = useMemo(() => buildPayload(template, templateState), [template, templateState]);
    const copyPayload = useCopy(payload);

    useEffect(() => {
        let cancelled = false;

        const renderCode = async () => {
            const text = payload.trim();
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
                const qrCode = await loadQRCodeModule();
                if (cancelled) {
                    return;
                }

                const [pngDataUrl, svgText] = await Promise.all([
                    renderQRCodePng(qrCode, text, safeWidth, errorLevel),
                    renderQRCodeSvg(qrCode, text, safeWidth, errorLevel),
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
                const message = error instanceof Error ? error.message : String(error);
                setRenderError(message);
                toast.error(message, { autoClose: 8000 });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        renderCode();

        return () => {
            cancelled = true;
        };
    }, [errorLevel, payload, width]);

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
                        <Form.Label>文本内容</Form.Label>
                        <Form.Control
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
                        <Form.Label>网址</Form.Label>
                        <Form.Control
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
                                <Form.Label>WiFi 名称</Form.Label>
                                <Form.Control
                                    value={current.wifi.ssid}
                                    onChange={(e) => updateTemplateField('wifi', 'ssid', e.target.value)}
                                    placeholder="MyWiFi"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>加密方式</Form.Label>
                                <select
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
                                <Form.Label>密码</Form.Label>
                                <Form.Control
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
                                <Form.Label>姓</Form.Label>
                                <Form.Control
                                    value={current.vcard.lastName}
                                    onChange={(e) => updateTemplateField('vcard', 'lastName', e.target.value)}
                                    placeholder="张"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>名</Form.Label>
                                <Form.Control
                                    value={current.vcard.firstName}
                                    onChange={(e) => updateTemplateField('vcard', 'firstName', e.target.value)}
                                    placeholder="三"
                                />
                            </Form.Group>
                        </div>
                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label>公司</Form.Label>
                                <Form.Control
                                    value={current.vcard.organization}
                                    onChange={(e) => updateTemplateField('vcard', 'organization', e.target.value)}
                                    placeholder="OpenAI"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>职位</Form.Label>
                                <Form.Control
                                    value={current.vcard.title}
                                    onChange={(e) => updateTemplateField('vcard', 'title', e.target.value)}
                                    placeholder="工程师"
                                />
                            </Form.Group>
                        </div>
                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label>电话</Form.Label>
                                <Form.Control
                                    value={current.vcard.phone}
                                    onChange={(e) => updateTemplateField('vcard', 'phone', e.target.value)}
                                    placeholder="13800138000"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>邮箱</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={current.vcard.email}
                                    onChange={(e) => updateTemplateField('vcard', 'email', e.target.value)}
                                    placeholder="demo@example.com"
                                />
                            </Form.Group>
                        </div>
                        <Form.Group>
                            <Form.Label>网址</Form.Label>
                            <Form.Control
                                type="url"
                                value={current.vcard.website}
                                onChange={(e) => updateTemplateField('vcard', 'website', e.target.value)}
                                placeholder="https://example.com"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>地址</Form.Label>
                            <Form.Control
                                value={current.vcard.address}
                                onChange={(e) => updateTemplateField('vcard', 'address', e.target.value)}
                                placeholder="北京市朝阳区"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>备注</Form.Label>
                            <Form.Control
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
                        <Form.Label>电话号码</Form.Label>
                        <Form.Control
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
                            <Form.Label>手机号</Form.Label>
                            <Form.Control
                                value={current.sms.number}
                                onChange={(e) => updateTemplateField('sms', 'number', e.target.value)}
                                placeholder="13800138000"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>短信内容</Form.Label>
                            <Form.Control
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
                            <Form.Label>收件人</Form.Label>
                            <Form.Control
                                type="email"
                                value={current.email.to}
                                onChange={(e) => updateTemplateField('email', 'to', e.target.value)}
                                placeholder="demo@example.com"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>主题</Form.Label>
                            <Form.Control
                                value={current.email.subject}
                                onChange={(e) => updateTemplateField('email', 'subject', e.target.value)}
                                placeholder="Hello"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>正文</Form.Label>
                            <Form.Control
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

    return (
        <div className="barcode-page">
            <div className="barcode-page__layout">
                <Card className="barcode-page__panel">
                    <Card.Header>二维码生成</Card.Header>
                    <Card.Body>
                        <Form.Group>
                            <Form.Label>模板</Form.Label>
                            <div className="barcode-kind-switcher" role="tablist" aria-label="二维码模板切换">
                                {templateOptions.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`barcode-kind-switcher__item${item.value === template ? ' is-active' : ''}`}
                                        onClick={() => setTemplate(item.value)}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            <div className="barcode-helper-text">{templateHelper}</div>
                        </Form.Group>

                        {renderTemplateFields()}

                        <div className="barcode-grid">
                            <Form.Group>
                                <Form.Label>目标宽度</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        inputMode="numeric"
                                        value={width}
                                        onChange={(e) => setWidth(e.target.value.replace(/[^\d]/g, ''))}
                                        placeholder="360"
                                    />
                                    <InputGroup.Text>px</InputGroup.Text>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>纠错等级</Form.Label>
                                <select
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

                        <Form.Group>
                            <Form.Label>编码内容</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                readOnly
                                spellCheck={false}
                                value={payload}
                                className="scrollable-textarea textarea-font"
                            />
                        </Form.Group>

                        <ButtonToolbar>
                            <ButtonGroup className="me-2 mt-2">
                                <Button variant="light" className="border" onClick={copyPayload} disabled={!payload.trim()}>复制内容</Button>
                                <Button variant="light" className="border" onClick={downloadPng} disabled={loading || !imageDataUrl}>下载 PNG</Button>
                                <Button variant="light" className="border" onClick={downloadSvg} disabled={loading || !svgMarkup}>下载 SVG</Button>
                                <Button variant="light" className="border" onClick={resetCurrentTemplate}>重置模板</Button>
                            </ButtonGroup>
                        </ButtonToolbar>
                    </Card.Body>
                </Card>

                <Card className="barcode-page__preview">
                    <Card.Header>预览</Card.Header>
                    <Card.Body>
                        <div className="barcode-preview-shell">
                            {svgMarkup ? <div className="barcode-preview-svg" dangerouslySetInnerHTML={{ __html: svgMarkup }} /> : null}
                        </div>
                        <div className="barcode-status-row">
                            <span>{loading ? '正在生成…' : `当前模板：${templateOptions.find((item) => item.value === template)?.label}`}</span>
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
    qrCode: QRCodeModule,
    text: string,
    width: number,
    errorCorrectionLevel: QRErrorLevel,
) => {
    return qrCode.toDataURL(text, {
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
    qrCode: QRCodeModule,
    text: string,
    width: number,
    errorCorrectionLevel: QRErrorLevel,
) => {
    return qrCode.toString(text, {
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
