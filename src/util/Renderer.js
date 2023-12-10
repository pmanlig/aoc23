import { drawFilledRect } from "./Drawing";

export class Renderer {
	constructor(styles, width, height, pixelSize) {
		this.styles = styles;
		pixelSize = pixelSize || 1;
		this.width = width * pixelSize;
		this.height = height * pixelSize;
		this.pixelSize = pixelSize;
	}

	drawPixel(ctx, x, y, style) {
		drawFilledRect(ctx, this.pixelSize * x, this.pixelSize * y, this.pixelSize * (x + 1), this.pixelSize * (y + 1), style);
	}

	draw(ctx, data) {
		for (let y = 0; y < data.length; y++) {
			for (let x = 0; x < data[y].length; x++) {
				let style = this.styles ?
					(typeof this.styles === 'object' ? this.styles[data[y][x]] : this.styles(data[y][x])) :
					"#000000";
				this.drawPixel(ctx, x, y, style);
			}
		}
	}
}