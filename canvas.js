const PI = 3.14159265359;

class Point {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	rot(px, py, rd) {
		
		let xn = (this.x - px) * Math.cos(rd) - (this.y - py) * Math.sin(rd);
		let yn = (this.x - px) * Math.sin(rd) + (this.y - py) * Math.cos(rd);
		this.x = xn + px;
		this.y = yn + py;
	}

	render(ctx) {
		ctx.fillStyle = 'rgb(200, 0, 30)';
		ctx.fillRect(this.x, this.y, 30, 30);

		/*
		ctx.fillStyle = 'rgb(200, 255, 255)';
		for (let i = 0; i < 10; i++) {
			this.rot(150, 100, 0.5*PI / 10);
			ctx.fillRect(this.x, this.y, 10, 10);
		}
		*/
	}

	
}

class Shape {
	points = [];
	constructor(pointList) {
		this.points = pointList;
	}

	render(ctx) {
		console.log(this.points);
		ctx.beginPath();
		ctx.fillStyle = 'rgba(255, 3, 39, 0.5)';
		ctx.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 0; i < this.points.length; i++) {
			ctx.lineTo(this.points[i].x, this.points[i].y);
		}
		ctx.lineTo(this.points[0].x, this.points[0].y);
		ctx.fill();
	}
	

}

let render = (ctx, els) => {
	els.forEach(el => el.render(ctx));
}

window.addEventListener('load', ev => {

	let ctx  = document.getElementById('ctx').getContext('2d');

	let p1 = new Point(80,80,80);
	let p2 = new Point(160, 80, 80);
	let p3 = new Point(100, 250, 80);
	let s = new Shape([p1, p2, p3]);
	s.render(ctx);
	//render(ctx, [p1, p2]);
});
