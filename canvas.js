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

	render(ctx, cam) {
		ctx.fillStyle = 'rgb(200, 0, 30)';
		ctx.fillRect(this.renderCam(cam).x, this.renderCam(cam).y, 5, 5);

		/*
		ctx.fillStyle = 'rgb(200, 255, 255)';
		for (let i = 0; i < 10; i++) {
			this.rot(150, 100, 0.5*PI / 10);
			ctx.fillRect(this.x, this.y, 10, 10);
		}
		*/
	}

	renderCam(cam) {
		//console.log('cx, cy, f', cam.cx, cam.cy, cam.f);
		let r = {
			x : (this.x - cam.cx) * cam.f / this.z + cam.cx ,
			y : (this.y - cam.cy) * cam.f / this.z + cam.cy,
		};
		console.log('r', this.x, this.y, this.z, r);
		return r;
	}

	renderFlat(cam) {
		return {
			x : this.x,
			y : this.y
		}
	}


}

class Camera {
	f;	
	cx;
	cy;

	drawCenter(ctx) {
		ctx.fillStyle = 'rgb(2, 2, 2)';
		ctx.fillRect(this.cx, this.cy, 2, 2);
		ctx.font = '12px Georgia';
		ctx.fillText('f = ' + this.f, 10, 10 );
	}
}

class Shape {
	points = [];
	constructor(pointList) {
		this.points = pointList;
	}

	render(ctx, cam) {
		console.log(this.points);
		ctx.beginPath();
		ctx.fillStyle = 'rgba(255, 3, 39, 0.333)';

		let p0 = this.points[0].renderCam(cam);
		ctx.moveTo(p0.x, p0.y);
		for (let i = 0; i < this.points.length; i++) {
			let thisPoint = this.points[i].renderCam(cam);
			ctx.lineTo(thisPoint.x, thisPoint.y);
		}
		ctx.lineTo(p0.x, p0.y);
		ctx.fill();
		ctx.stroke();
	}
	
	rot(px, py, rd) {
		this.points.forEach(p => { p.rot(px, py, rd); });
	}

}

let render = () => {
	let ctx  = document.getElementById('ctx').getContext('2d');
	ctx.clearRect(0, 0, 400, 400);

	
	/*
	let p10 = new Point(80,80,80);
	let p20 = new Point(160, 80, 80);
	let p30 = new Point(160, 160, 80);
	let p40 = new Point(80, 160, 80);
	
	let p11 = new Point(80,80, 200);
	let p21 = new Point(160, 80, 200);
	let p31 = new Point(160, 160, 200);
	let p41 = new Point(80, 160, 200);

	let s0 = new Shape([p10, p20, p30, p40]);
	let s1 = new Shape([p11, p21, p31, p41]);
	*/

	let cam = new Camera();
	cam.f = f;
	cam.cx = cx;
	cam.cy = cy;
	cam.drawCenter(ctx);
	
	points.forEach(p => {
		p.render(ctx, cam);
	});

	//s0.render(ctx, cam);
	//s1.render(ctx, cam);
}

let objReader = (fname, m = 200, xa = 20, ya = 20, za = 220) => {
	// https://people.sc.fsu.edu/~jburkardt/data/obj/obj.html
	let pr = new Promise((resolve, reject) => {
		fetch(fname)
		.then(r => r.text())
		.then(text => {
			points = [];
			text.split('\n').forEach(line => {
				//console.log(line);
				let vMatcher = line.match('v  ([0-9]+\.[0-9]+).+([0-9]+\.[0-9]+).+([0-9]+\.[0-9]+)');
				if (vMatcher) {
					
					console.log('l:' , vMatcher[1], vMatcher[2], vMatcher[3]);
					let p = new Point(parseInt(vMatcher[1]) * m + xa,
										parseInt(vMatcher[2]) * m + ya,
										parseInt(vMatcher[3]) * m + za
								);
					points.push(p);
				}
			});
			console.log(points);
			resolve(points);
		});
	});
	return pr;
};

let f = 80;
let cx = 120;
let cy = 120;
let points;

window.addEventListener('load', ev => {
	
	objReader('cube.obj').then(points_ => {
		points = points_;
		render();
	});

	document.getElementById('fplus').addEventListener('click', ev => {
		f+=10;
		render();
	});
	document.getElementById('fminus').addEventListener('click', ev => {
		f-=10;
		render();
	});
	document.getElementById('cxplus').addEventListener('click', ev => {
		cx+=10;
		render();
	});
	document.getElementById('cxminus').addEventListener('click', ev => {
		cx-=10;
		render();
	});
	document.getElementById('cyplus').addEventListener('click', ev => {
		cy+=10;
		render();
	});
	document.getElementById('cyminus').addEventListener('click', ev => {
		cy-=10;
		render();
	});
});
