import './AppHeader.css';
import React from 'react';

export default class AppHeader extends React.Component {
	render() {
		let day = this.props.day;
		return <header className="App-header">
			{day && day > 1 && <input className="prev" type="button" value="< Previous" onClick={e => { e.stopPropagation(); window.location.href = `${process.env.PUBLIC_URL}/#/${day - 1}`; }} />}
			{day && day < 25 && <input className="next" type="button" value="Next >" onClick={e => { e.stopPropagation(); window.location.href = `${process.env.PUBLIC_URL}/#/${day + 1}`; }} />}
			<div onClick={() => { window.location.href = `${process.env.PUBLIC_URL}/` }}><h1>{day ? `Advent of Code 2015 - Day ${day}` : "Advent of Code 2015"}</h1></div>
		</header>
	}
}
