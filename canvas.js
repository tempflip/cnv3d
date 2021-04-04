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
		//console.log('r', this.x, this.y, this.z, r);
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
		ctx.fillText('f = ' + this.f +
					'\ncx = ' + this.cx +
					'\ncy = ' + this.cy
						, 10, 10 );
	}
}

class Shape {
	points = [];
	constructor(pointList) {
		this.points = pointList;
	}

	render(ctx, cam) {
		//console.log(this.points);
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
	ctx.clearRect(0, 0, 600, 600);

	
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

	faces.forEach(f => {
		f.render(ctx, cam);
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
			let vertices = [];
			let faces = [];
			text.split('\n').forEach(line => {
				//console.log(line);
				let vMatcher = line.match('v  (-?[0-9]+\.[0-9]+) +(-?[0-9]+\.[0-9]+) +(-?[0-9]+\.[0-9]+)');
				let fMatcher = line.match('f  ([0-9]+) +([0-9]+) +([0-9]+)');
				if (vMatcher) {
					let xComp = parseInt(vMatcher[1]);
					let yComp = parseInt(vMatcher[2]);
					let zComp = parseInt(vMatcher[3]);

					//console.log('l:' , xComp, yComp, zComp); 
					let p = new Point(xComp * m + xa,
										 yComp * m + ya,
										 zComp * m + za
								);
					vertices.push(p);
				} else if (fMatcher) {
					let f1 = parseInt(fMatcher[1]);
					let f2 = parseInt(fMatcher[2]);
					let f3 = parseInt(fMatcher[3]);
					//console.log('ff', f1, f2, f3);
					let face = new Shape([ vertices[f1-1], vertices[f2-1], vertices[f3-1] ]);
					faces.push(face);
				}
			});
			
			let r = { vertices : vertices, faces : faces};
			console.log(r);
			resolve(r);
		});
	});
	return pr;
};

let territory = (points) => {
	let xmax = -999, ymax= -999, zmax = -999, xmin = 9999, ymin = 9999, zmin = 9999;
	points.forEach(p => {
		if (p.x > xmax) xmax = p.x;
		if (p.y > ymax) ymax = p.y;
		if (p.z > zmax) zmax = p.z;
		if (p.x < xmin) xmin = p.x;
		if (p.y < ymin) ymin = p.y;
		if (p.z < zmin) zmin = p.z;
	});
	return {xmax : xmax, ymax : ymax, zmax : zmax,
			xmin : ymin, ymin : ymin, zmin : zmin};
};

let f = 200;
let cx = 120;
let cy = 120;
let points;
let faces;

window.addEventListener('load', ev => {
	
	objReader('teapot.obj', 3, 200, 200, 300).then(obj_ => {
		points = obj_.vertices;
		faces = obj_.faces;
		console.log('territory', territory(points));
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
