import { useState, useMemo } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { Eye, EyeSlash, Plus, Trash, Copy } from 'react-bootstrap-icons';
import { useCopy } from '@/hooks/use-basic';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

interface JwtField {
    key: string;
    value: string;
}

const JwtPage: React.FC = () => {
    const [secret, setSecret] = useState('');
    const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 3600 * 1000)); // 默认1小时后
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

        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(`${encodedHeader}.${encodedPayload}`)
        );

        const signatureArray = Array.from(new Uint8Array(signature));
        const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

        return `${encodedHeader}.${encodedPayload}.${signatureBase64}`;
    }

    useMemo(() => {
        generateToken(secret, expiresAt, fields).then(setToken);
    }, [secret, expiresAt, fields]);

    const copy = useCopy(token);
    const toggleShowSecret = () => setShowSecret(!showSecret);

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
                <Form.Label>密钥</Form.Label>
                <InputGroup>
                    <Form.Control
                        type={showSecret ? 'text' : 'password'}
                        onChange={e => setSecret(e.target.value.trim())}
                        autoComplete='off'
                    />
                    <Button variant="light" className="border" onClick={toggleShowSecret}>
                        {showSecret ? <EyeSlash /> : <Eye />}
                    </Button>
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>过期时间</Form.Label>
                <DateTime
                    value={expiresAt}
                    onChange={(date) => {
                        if (!date) return;

                        let newDate: Date;
                        if (date instanceof Date) {
                            newDate = date;
                        } else if (typeof date === 'string') {
                            newDate = new Date(date);
                        } else if (typeof date.toDate === 'function') {
                            // 处理moment对象
                            newDate = date.toDate();
                        } else {
                            // 其他未知类型，尝试转换
                            newDate = new Date(date.toString());
                        }

                        if (isNaN(newDate.getTime())) return; // 确保日期有效
                        setExpiresAt(newDate);
                    }}
                    inputProps={{
                        className: 'form-control',
                        placeholder: '选择过期时间'
                    }}
                    timeFormat="HH:mm"
                    dateFormat="YYYY-MM-DD"
                    isValidDate={(current) => current.isAfter(new Date())}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>自定义字段</Form.Label>
                <div className="mb-2">
                    {fields.map((field, index) => (
                        <InputGroup key={index} className="mb-2">
                            <Form.Control
                                placeholder="字段名"
                                value={field.key}
                                onChange={e => updateField(index, e.target.value, field.value)}
                            />
                            <Form.Control
                                placeholder="字段值"
                                value={field.value}
                                onChange={e => updateField(index, field.key, e.target.value)}
                            />
                            <Button variant="danger" onClick={() => removeField(index)}>
                                <Trash />
                            </Button>
                        </InputGroup>
                    ))}
                </div>
                <Button variant="light" className="border" onClick={addField}>
                    <Plus /> 添加字段
                </Button>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>JWT Token</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={5}
                    value={token}
                    readOnly
                    className='textarea-font'
                />
            </Form.Group>
            <Button variant="light" className="border" onClick={copy}>
                <Copy /> 复制
            </Button>
        </>
    )
}

export default JwtPage
