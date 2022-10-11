import './Input.css';
import React from 'react';

export default class Input extends React.Component {
	render() {
		return <div className="input">
			Input:
			<textarea placeholder="<No input yet>" value={this.props.value} onChange={this.props.onChange}/>
			Number of lines: {this.props.value ? this.props.value.split('\n').length : 0}
		</div>
	}
}