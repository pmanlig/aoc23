import './CssImage.css';
import React from 'react';

export class CssImage extends React.Component {
	render() {
		let { value, colors } = this.props;
		if (!value || !colors) return <div className="css-image"></div>;
		console.log("rendering");
		console.log(value);
		console.log(colors);

		let ri = 0, ci = 0;
		let rows = value.filter(r => r !== undefined);
		let maxcol = Math.max(...rows.map(r => r.length));
		rows.forEach(r => {
			for (let i = 0; i < maxcol; i++) { r[i] = r[i] === 1 ? 1 : 0 }
		});
		return <div className="css-image">
			{rows.map(r => <div className="css-image-row" key={ri++}>{r.map(c => <div className="css-image-pixel" key={ci++} style={{ backgroundColor: colors[c] }}></div>)}</div>)}
		</div>;
	}
}