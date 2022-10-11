import './AppGrid.css'
import React from 'react'
import AppHeader from './AppHeader';

export class AppGrid extends React.Component {
	render() {
		return <div className="App">
			<AppHeader />
			<div className="App-grid">
				{Array.apply(null, { length: 25 }).map((e, i) =>
					<div key={i} onClick={e => window.location.href = `${process.env.PUBLIC_URL}/#/${i + 1}`}>{i + 1}</div>
				)}
			</div>
		</div>
	}
}