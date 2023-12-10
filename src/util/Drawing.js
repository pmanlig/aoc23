export function drawCircle(ctx, x, y, radius, style, lineWidth) {
	if (style) ctx.strokeStyle = style;
	if (lineWidth) ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.stroke();
}

export function drawFilledCircle(ctx, x, y, radius, style) {
	if (style) ctx.fillStyle = style;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fill();
}

export function drawLine(ctx, x1, y1, x2, y2, style, lineWidth) {
	if (style) ctx.strokeStyle = style;
	if (lineWidth) ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

export function drawFilledRect(ctx, x1, y1, x2, y2, style) {
	if (style) ctx.fillStyle = style;
	ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
}

export function drawText(ctx, x, y, text, style, font) {
	if (style) ctx.fillStyle = style;
	if (style) ctx.strokeStyle = style;
	if (font) ctx.font = font;
	ctx.textBaseline = "top";
	ctx.fillText(text, x, y);
}