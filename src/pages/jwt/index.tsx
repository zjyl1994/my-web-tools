import ControlGroup from '@/components/ui/control-group';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Form, Button, InputGroup } from '@/components/ui';
import CopyButton from '@/components/ui/copy-button';
import { Base64 } from 'js-base64';

const JwtDatePicker = lazy(() => import('./date-picker'));

interface JwtField {
    key: string;
    value: string;
}

const JwtPage = () => {
    const [secret, setSecret] = useState('');
    const [expiresAt, setExpiresAt] = useState<Date>(() => new Date(Date.now() + 3600 * 1000)); // 默认1小时后
    const [fields, setFields] = useState<JwtField[]>([]);
    const [token, setToken] = useState('');
    const [showSecret, setShowSecret] = useState(false);

    const generateToken = async (secret: string, expiresAt: Date | null, fields: JwtField[]) => {
        if (!secret || !expiresAt) return '';

        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iat: now,
            nbf: now,
            exp: Math.floor(expiresAt.getTime() / 1000),
            ...fields.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
        };

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        // 使用 Base64.encodeURI 进行 URL 安全的 Base64 编码
        const encodedHeader = Base64.encodeURI(JSON.stringify(header));
        const encodedPayload = Base64.encodeURI(JSON.stringify(payload));
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(`${encodedHeader}.${encodedPayload}`)
        );

        // 将签名转换为 URL 安全的 Base64 格式
        const signatureBase64 = Base64.fromUint8Array(new Uint8Array(signature),true);

        return `${encodedHeader}.${encodedPayload}.${signatureBase64}`;
    }

    useEffect(() => {
        let cancelled = false;
        generateToken(secret, expiresAt, fields).then((nextToken) => {
            if (!cancelled) {
                setToken(nextToken);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [secret, expiresAt, fields]);

    const toggleShowSecret = () => setShowSecret(!showSecret);
    const handleExpiresAtChange = (nextDate: Date | null) => {
        if (!nextDate) {
            return;
        }

        if (Number.isNaN(nextDate.getTime()) || nextDate.getTime() <= Date.now()) {
            return;
        }

        setExpiresAt(nextDate);
    };

    const addField = () => setFields([...fields, { key: '', value: '' }]);
    const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));
    const updateField = (index: number, key: string, value: string) => {
        const newFields = [...fields];
        newFields[index] = { key, value };
        setFields(newFields);
    };

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="jwt-field-1">密钥</Form.Label>
                <ControlGroup end={
                    <Button variant="light" onClick={toggleShowSecret} aria-controls="jwt-field-1" aria-label={showSecret ? '隐藏密钥' : '显示密钥'}>
                        {showSecret ? '隐藏' : '显示'}
                    </Button>
                }>
                    <Form.Control id="jwt-field-1"
                        type={showSecret ? 'text' : 'password'}
                        onChange={e => setSecret(e.target.value.trim())}
                        autoComplete='off'
                    />
                </ControlGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="jwt-expires-at">过期时间</Form.Label>
                <Suspense fallback={<Form.Control id="jwt-expires-at" value="" placeholder="加载日期组件中..." readOnly />}>
                    <JwtDatePicker value={expiresAt} onChange={handleExpiresAtChange} />
                </Suspense>
            </Form.Group>

            <Form.Group className="mb-3">
                <div className="ui-label">自定义字段</div>
                <div className="mb-2">
                    {fields.map((field, index) => (
                        <InputGroup key={index} className="mb-2">
                            <Form.Control
                                aria-label={`自定义字段 ${index + 1} 的名称`}
                                placeholder="字段名"
                                value={field.key}
                                onChange={e => updateField(index, e.target.value, field.value)}
                            />
                            <Form.Control
                                aria-label={`自定义字段 ${index + 1} 的值`}
                                placeholder="字段值"
                                value={field.value}
                                onChange={e => updateField(index, field.key, e.target.value)}
                            />
                            <Button variant="danger" aria-label={`删除自定义字段 ${index + 1}`} onClick={() => removeField(index)}>
                                删除
                            </Button>
                        </InputGroup>
                    ))}
                </div>
                <Button variant="light" className="border" onClick={addField}>
                    添加字段
                </Button>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="jwt-field-2">JWT Token</Form.Label>
                <Form.Control id="jwt-field-2"
                    as="textarea"
                    rows={5}
                    value={token}
                    placeholder="输入密钥后自动生成 JWT"
                    readOnly
                    className="ui-result-field"
                />
            </Form.Group>
            <CopyButton text={token} label="复制 JWT" variant="primary" disabled={!token} />
        </>
    )
}

export default JwtPage
