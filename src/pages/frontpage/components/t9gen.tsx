import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';

const T9Gen: React.FC = () => {

    const lettersToNumbers = (input: string): string => {
        const mapping: { [key: string]: string } = {
            'a': '2', 'b': '2', 'c': '2',
            'd': '3', 'e': '3', 'f': '3',
            'g': '4', 'h': '4', 'i': '4',
            'j': '5', 'k': '5', 'l': '5',
            'm': '6', 'n': '6', 'o': '6',
            'p': '7', 'q': '7', 'r': '7', 's': '7',
            't': '8', 'u': '8', 'v': '8',
            'w': '9', 'x': '9', 'y': '9', 'z': '9'
        };

        return input
            .toLowerCase()
            .split('')
            .map(char => {
                // 如果是字母或数字，进行处理；否则忽略
                if (/[a-z]/.test(char)) {
                    return mapping[char] || '';
                } else if (/[0-9_\- ]/.test(char)) {
                    return char;
                }
                return ''; // 忽略其他字符
            })
            .join('');
    }

    const [value, setValue] = useState('');
    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>字母转拨号数字</Card.Title>
                <Card.Text className="my-2">
                    <Form.Control
                        className="my-2"
                        value={value}
                        onChange={e => {
                            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_\- ]/g, '');
                            setValue(sanitizedValue.toUpperCase());
                        }}
                        placeholder="输入英文字母"
                    />
                    <Form.Control className="my-2" value={lettersToNumbers(value)} readOnly placeholder="转换结果"/>
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default T9Gen;
