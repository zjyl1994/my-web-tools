import { useMemo, useState } from 'react';
import { Button, ButtonGroup, Card, Form } from '@/components/ui';
import { useCopy, usePaste } from '@/hooks/use-basic';
import dayjs from 'dayjs';

const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
type TimestampPrecision = 'seconds' | 'milliseconds';

const nowTimestamp = () => dayjs().unix().toString();

const detectTimestampPrecision = (value: string): TimestampPrecision => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return 'seconds';
    }

    const numericValue = Number(trimmedValue);
    if (!Number.isFinite(numericValue)) {
        return 'seconds';
    }

    return Math.abs(numericValue) >= 1e11 ? 'milliseconds' : 'seconds';
};

const parseTimestamp = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return null;
    }

    const numericValue = Number(trimmedValue);
    if (!Number.isFinite(numericValue)) {
        return null;
    }

    const parsedValue = detectTimestampPrecision(trimmedValue) === 'milliseconds'
        ? dayjs(numericValue)
        : dayjs.unix(numericValue);

    if (!parsedValue.isValid()) {
        return null;
    }

    return parsedValue;
};

const formatTimestamp = (value: string) => {
    const parsedValue = parseTimestamp(value);
    if (!parsedValue) {
        return '';
    }

    return parsedValue.format(DEFAULT_TIME_FORMAT);
};

const formatDatetime = (value: string, precision: TimestampPrecision) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return '';
    }

    const parsedValue = dayjs(trimmedValue);
    if (!parsedValue.isValid()) {
        return '';
    }

    return precision === 'milliseconds'
        ? parsedValue.valueOf().toString()
        : parsedValue.unix().toString();
};

const TimeConv: React.FC = () => {
    const [timestampValue, setTimestampValue] = useState(nowTimestamp);
    const [datetimeValue, setDatetimeValue] = useState(() => formatTimestamp(nowTimestamp()));
    const [timestampPrecision, setTimestampPrecision] = useState<TimestampPrecision>('seconds');

    const timestampCopy = useCopy(timestampValue);
    const timestampPaste = usePaste((text) => {
        setTimestampPrecision(detectTimestampPrecision(text));
        setTimestampValue(text);
        setDatetimeValue(formatTimestamp(text));
    });

    const datetimeCopy = useCopy(datetimeValue);
    const datetimePaste = usePaste((text) => {
        setDatetimeValue(text);
        setTimestampValue(formatDatetime(text, timestampPrecision));
    });

    const timestampInvalid = useMemo(
        () => timestampValue.trim() !== '' && formatTimestamp(timestampValue) === '',
        [timestampValue],
    );

    const datetimeInvalid = useMemo(
        () => datetimeValue.trim() !== '' && formatDatetime(datetimeValue, timestampPrecision) === '',
        [datetimeValue, timestampPrecision],
    );

    const setNow = () => {
        const nextTimestamp = nowTimestamp();
        setTimestampPrecision('seconds');
        setTimestampValue(nextTimestamp);
        setDatetimeValue(formatTimestamp(nextTimestamp));
    };

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>时间戳</Card.Title>

                <Form.Group className="mb-3 mt-2">
                    <Form.Label>时间戳</Form.Label>
                    <Form.Control
                        value={timestampValue}
                        onChange={(e) => {
                            const nextValue = e.target.value;
                            setTimestampPrecision(detectTimestampPrecision(nextValue));
                            setTimestampValue(nextValue);
                            setDatetimeValue(formatTimestamp(nextValue));
                        }}
                        placeholder="输入 Unix 时间戳（秒或毫秒）"
                    />
                    {timestampInvalid ? <div className="ui-helper-text text-danger mt-1">请输入有效的 Unix 时间戳</div> : null}
                    <ButtonGroup className="mt-2">
                        <Button variant="light" className="border" onClick={setNow}>填入当前时间</Button>
                        <Button variant="light" className="border" onClick={timestampCopy}>复制时间戳</Button>
                        <Button variant="light" className="border" onClick={timestampPaste}>粘贴时间戳</Button>
                    </ButtonGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>时间字符串</Form.Label>
                    <Form.Control
                        value={datetimeValue}
                        onChange={(e) => {
                            const nextValue = e.target.value;
                            setDatetimeValue(nextValue);
                            setTimestampValue(formatDatetime(nextValue, timestampPrecision));
                        }}
                        placeholder={DEFAULT_TIME_FORMAT}
                    />
                    {datetimeInvalid ? <div className="ui-helper-text text-danger mt-1">请输入可解析的时间字符串</div> : null}
                    <ButtonGroup className="mt-2">
                        <Button variant="light" className="border" onClick={datetimeCopy}>复制时间字符串</Button>
                        <Button variant="light" className="border" onClick={datetimePaste}>粘贴时间字符串</Button>
                    </ButtonGroup>
                </Form.Group>
            </Card.Body>
        </Card>
    );
};

export default TimeConv;
