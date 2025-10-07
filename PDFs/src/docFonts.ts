// Static asset data URL Imports

import FontInterBold from "../assets/fonts/Inter/static/Inter_18pt-Bold.ttf";
import FontInter from "../assets/fonts/Inter/static/Inter_18pt-Regular.ttf";
import { FONT_SIZE, TEXT_COLOR } from "./constants";

export const WhatFontInter = FontInter;

export function docRegisterStandardFonts(doc: PDFKit.PDFDocument) {
    
    try
    {
        doc.registerFont("Inter", FontInter);
        doc.registerFont("Inter-Bold", FontInterBold);
    }
    catch (error)
    {
        console.error("Unable to load Fonts", error);
        throw error;
    }
}

export function docApplyStandardFont(doc: PDFKit.PDFDocument)
{
    doc.font("Inter").fontSize(FONT_SIZE).lineGap(6).fillColor(TEXT_COLOR);
}