
export function docItem(doc: PDFKit.PDFDocument, name: string, labelWidth: number, value: any, options?: PDFKit.Mixins.TextOptions, x?: number, y?: number,) {
	const x0 = x ?? doc.x;
	const y0 = y ?? doc.y;

	const GAP = 20;

	const right = doc.page.width - doc.page.margins.right;
	const labelW = labelWidth + 1;
	const valueX = x0 + labelW + GAP;
	const valueW = right - valueX;

	const labelH = doc.heightOfString(String(name ?? ""), { width: labelW, ...options });
	const valueH = doc.heightOfString(String(value ?? ""), { width: valueW, ...options });
	const rowH = Math.max(labelH, valueH);

	doc.text(String(name ?? ""), x0, y0, { width: labelW, align: "left", continued: false, ...options });
	doc.text(String(value ?? ""), valueX, y0, { width: valueW, continued: false, ...options });

	doc.x = x0;
	doc.y = y0 + rowH;
}