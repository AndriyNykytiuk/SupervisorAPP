import React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { uk } from 'date-fns/locale/uk'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('uk', uk)

const DateTimePicker = ({
    value,
    onChange,
    placeholder = 'дд.мм.рррр, гг:хх',
    className = '',
    withTime = true,
    minDate,
}) => {
    const dateValue = value ? (value instanceof Date ? value : new Date(value)) : null

    return (
        <DatePicker
            selected={dateValue}
            onChange={onChange}
            showTimeSelect={withTime}
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Час"
            dateFormat={withTime ? 'dd.MM.yyyy HH:mm' : 'dd.MM.yyyy'}
            locale="uk"
            placeholderText={placeholder}
            portalId="datepicker-portal"
            className={className}
            minDate={minDate}
            isClearable
            autoComplete="off"
        />
    )
}

export default DateTimePicker
