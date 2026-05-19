import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface JwtDatePickerProps {
    value: Date;
    onChange: (nextDate: Date | null) => void;
}

const JwtDatePicker = ({ value, onChange }: JwtDatePickerProps) => {
    const now = new Date();
    const isToday = value.toDateString() === now.toDateString();
    const minSelectableTime = isToday ? now : new Date(0, 0, 0, 0, 0);
    const maxSelectableTime = new Date(0, 0, 0, 23, 59);

    return (
        <DatePicker
            selected={value}
            onChange={onChange}
            minDate={now}
            minTime={minSelectableTime}
            maxTime={maxSelectableTime}
            showTimeSelect
            timeIntervals={5}
            dateFormat="yyyy-MM-dd HH:mm"
            className="ui-control"
            wrapperClassName="jwt-datepicker-wrapper"
            calendarClassName="jwt-datepicker-calendar"
            popperClassName="jwt-datepicker-popper"
            placeholderText="选择过期时间"
        />
    );
};

export default JwtDatePicker;
