import { useState, useMemo } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { useCopy } from '@/hooks/use-basic';

const HmacPage: React.FC = () => {
    const [plaintext, setPlaintext] = useState('');
    const [hmacKey, setHmacKey] = useState('');
    const [hashResult, setHashResult] = useState('');
    const [showKey, setShowKey] = useState(false);

    const calculate = async (plaintext: string, hmacKey: string) => {
        if (!hmacKey) return '';
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(hmacKey),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(plaintext));
        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    useMemo(() => {
        calculate(plaintext, hmacKey).then(setHashResult);
    }, [plaintext, hmacKey]);

    const copy = useCopy(hashResult);
    const toggleShowKey = () => setShowKey(!showKey);

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>密钥</Form.Label>
                <InputGroup>
                    <Form.Control
                        type={showKey ? 'text' : 'password'}
                        onChange={e => setHmacKey(e.target.value.trim())}
                        autoComplete='off'
                    />
                    <Button variant="light" className="border" onClick={toggleShowKey}>
                        {showKey ? <EyeSlash /> : <Eye />}
                    </Button>
                </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>明文</Form.Label>
                <Form.Control type="text" onChange={e => setPlaintext(e.target.value.trim())} autoComplete='off' />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>哈希</Form.Label>
                <Form.Control type="text" value={hashResult} readOnly />
            </Form.Group>
            <Button variant="light" className="border" onClick={copy}>复制</Button>
        </>
    )
}

export default HmacPage
