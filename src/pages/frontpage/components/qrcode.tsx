import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import { QRCodeCanvas } from 'qrcode.react';

const QrcodeGen: React.FC = () => {
    const [url, setUrl] = useState(window.location.toString());

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>二维码</Card.Title>
                <Card.Text className="my-2">
                    <Form.Control value={url} onChange={e => setUrl(e.target.value)} />
                </Card.Text>
                <QRCodeCanvas value={url} />
            </Card.Body>
        </Card>
    )
};

export default QrcodeGen
