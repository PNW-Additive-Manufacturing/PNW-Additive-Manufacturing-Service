"use client";

import { useCallback } from "react";

export default function useClipboard()
{
    const copyToClipboard = useCallback((content: string) => {
        return navigator.clipboard.writeText(content);
    }, []);

    return { copyToClipboard };
}