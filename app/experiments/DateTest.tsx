"use client";

import { useState } from "react"
import { formateDateWithTime } from "../api/util/Constants";
import { fixInputDate, formatDateForHTMLInput } from "../utils/TimeUtils";

export default function DateTest() {
    const [date, setDate] = useState<Date>(new Date());

    return <div>

        <label>Date and Time</label>
        <input
            defaultValue={formatDateForHTMLInput(date)}
            type="date"
            onChange={(ev) => {
                setDate(fixInputDate(ev.currentTarget.valueAsNumber));
                // setDate(new Date(ev.currentTarget.valueAsNumber));
            }}
        />

        {
            date && <>

                <p>{formateDateWithTime(date)}</p>

            </>
        }

    </div >
}