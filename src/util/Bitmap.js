import React, { useRef, useEffect } from 'react';

export const Bitmap = ({ data, renderer }) => {
	const ref = useRef(null);
	useEffect(() => {
		const ctx = ref.current.getContext("2d");
		renderer.draw(ctx, data);
	});
	return <canvas ref={ref} width={renderer.width} height={renderer.height} />
}