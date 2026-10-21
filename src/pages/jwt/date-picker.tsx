import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import { Button, Modal } from '@/components/ui';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker.css';

interface JwtDatePickerProps {
    value: Date;
    onChange: (nextDate: Date | null) => void;
}

const weekdays: Record<string, string> = {
    Sunday: '日', Monday: '一', Tuesday: '二', Wednesday: '三',
    Thursday: '四', Friday: '五', Saturday: '六',
};

const JwtDatePicker = ({ value, onChange }: JwtDatePickerProps) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const now = new Date();
    const isToday = value.toDateString() === now.toDateString();
    const minSelectableTime = isToday ? now : new Date(0, 0, 0, 0, 0);
    const maxSelectableTime = new Date(0, 0, 0, 23, 59);

    return <>
        <button
            ref={triggerRef}
            id="jwt-expires-at"
            type="button"
            className="ui-control jwt-datepicker-trigger"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
        >{dayjs(value).format('YYYY-MM-DD HH:mm')}</button>
        <Modal show={open} onHide={() => setOpen(false)} finalFocus={triggerRef}>
            <Modal.Header closeButton>
                <Modal.Title>选择过期时间</Modal.Title>
            </Modal.Header>
            <Modal.Body className="jwt-datepicker-body">
                <DatePicker
                    inline
                    selected={value}
                    onChange={onChange}
                    minDate={now}
                    minTime={minSelectableTime}
                    maxTime={maxSelectableTime}
                    showTimeSelect
                    timeIntervals={5}
                    timeFormat="HH:mm"
                    timeCaption="时间"
                    calendarClassName="jwt-datepicker-calendar"
                    formatWeekDay={(name) => weekdays[name] ?? name}
                    renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                        <div className="jwt-datepicker-month-heading">
                            <Button aria-label="上个月" disabled={prevMonthButtonDisabled} onClick={decreaseMonth}>‹</Button>
                            <span aria-live="polite">{dayjs(date).format('YYYY年M月')}</span>
                            <Button aria-label="下个月" disabled={nextMonthButtonDisabled} onClick={increaseMonth}>›</Button>
                        </div>
                    )}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => setOpen(false)}>完成</Button>
            </Modal.Footer>
        </Modal>
    </>;
};

export default JwtDatePicker;
