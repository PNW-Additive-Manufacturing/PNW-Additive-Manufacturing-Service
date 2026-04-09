import { useEffect, useState } from "react";

export default function useDate(intervalS = 60) {

    const [date, setDate] = useState(() => new Date());

    const intervalMs = intervalS * 1000;

    useEffect(() => {

        const id = setInterval(() => {
            setDate(new Date());
        }, intervalMs);

        return () => clearInterval(id);
        
    }, [intervalMs]);

    return date;
}
