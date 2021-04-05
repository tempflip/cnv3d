const PI = 3.14159265359;

class Point {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	rotZ(px, py, rd) {
		let xn = (this.x - px) * Math.cos(rd) - (this.y - py) * Math.sin(rd);
		let yn = (this.x - px) * Math.sin(rd) + (this.y - py) * Math.cos(rd);
		this.x = xn + px;
		this.y = yn + py;
	}
	
	rotY(px, pz, rd) {
		//console.log('old', this.x, this.z);
		let xn = (this.x - px) * Math.cos(rd) - (this.z - pz) * Math.sin(rd);
		let zn = (this.x - px) * Math.sin(rd) + (this.z - pz) * Math.cos(rd);
		this.x = xn + px;
		this.z = zn + pz;
		//console.log('new', this.x, this.z);
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
	
	renderTop(ctx) {
		ctx.fillStyle = 'rgb(200, 100, 130)';
		ctx.fillRect(this.renderTop_().x, this.renderTop_().y, 5, 5);
	}
	
	renderTop_() {
		return {
			x : this.x,
			y : this.z
		}
	}


}

class Camera {
	o;
	fp;
	get alpha() {
		let opp = parseInt(this.fp.x - this.o.x);
		let adj = parseInt(this.fp.z - this.o.z);
		let tan = opp / adj;
		let arctan = Math.atan(tan);

		console.log(opp, adj, tan, arctan, arctan * 57.29);
		return arctan;
	}

	get f() {
		return Math.sqrt((this.o.x - this.fp.x)**2 + (this.o.z - this.fp.z)**2);
	}
	get cx() { return this.o.x; }
	get cy() { return this.o.y; }
	get cz() { return this.o.z; }

	drawCenter(ctx) {
		ctx.fillStyle = 'rgb(2, 2, 2)';
		ctx.fillRect(this.cx, this.cy, 2, 2);
		ctx.font = '12px Georgia';
		ctx.fillText('f = ' + this.f +
					'\ncx = ' + this.cx +
					'\ncy = ' + this.cy
						, 10, 10 );
	}

	drawCamLine(ctx) {
		console.log('camline', this.cx, this.cz, this.fx, this.fz, ctx);

		ctx.fillStyle = 'rgb(2, 222, 2)'; // green : O
		ctx.fillRect(this.cx, this.cz, 20, 20);
		ctx.fillStyle = 'rgb(222, 2, 2)';
		ctx.fillRect(this.fp.x, this.fp.z, 20, 20); // red : focal
		ctx.beginPath();
		ctx.moveTo(this.cx, this.cz);
		ctx.moveTo(this.fp.x, this.fp.z);
		ctx.stroke();
		ctx.font = '12px Georgia';
		ctx.fillText('alpha = ' + this.alpha * 57.29  , 20, 20);
	}
	
	rotAroundFocal(rd) {
		this.o.rotY(this.fp.x, this.fp.z, rd);
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
	let topview= document.getElementById('topview').getContext('2d');
	ctx.clearRect(0, 0, 900, 800);
	topview.clearRect(0, 0, 900, 800);

	cam.drawCenter(ctx);
	cam.drawCamLine(topview);

	points.forEach(p => {
		p.render(ctx, cam);
		p.renderTop(topview);
	});

	faces.forEach(f => {
		f.render(ctx, cam);
	});

}
	/*window.setInterval(() => {

		rot1();
		render();
	}, 100);*/

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
			xmin : ymin, ymin : ymin, zmin : zmin,
			xmid : (xmax+xmin) / 2,
			ymid : (ymax+ymin) / 2,
			zmid : (zmax+zmin) / 2

			};
};

let rot1 = () => {
	points.forEach(f => {
		f.rotY(ter.xmid, ter.zmid, PI/19);
		f.rotZ(ter.xmid, ter.ymid, PI/24);
	});
}

let cx = 400;
let cy = 400;
let cz = 0;
let points;
let faces;
let ter;
let o = new Point(cx, cy, cz);
let fp = new Point(cx, cy, cz + 300);
let cam = new Camera();
cam.o = o; 
cam.fp = fp;


window.addEventListener('load', ev => {
	
	objReader('teapot.obj', 3, 400, 400, 400).then(obj_ => {
		points = obj_.vertices;
		faces = obj_.faces;
		ter = territory(points);
		console.log('# territory', ter);
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
		o.x+=10;
		render();
	});
	document.getElementById('cxminus').addEventListener('click', ev => {
		o.x-=10;
		render();
	});
	document.getElementById('cyplus').addEventListener('click', ev => {
		//o.x+=10;
		render();
	});
	document.getElementById('cyminus').addEventListener('click', ev => {
		//cy-=10;
		render();
	});
	document.getElementById('rot1').addEventListener('click', ev => {
		rot1();	
		render();
	});
	document.getElementById('rotcam').addEventListener('click', ev => {
		cam.rotAroundFocal(PI/40);	
		render();
	});
});
