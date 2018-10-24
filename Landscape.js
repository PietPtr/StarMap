class Landscape {
	constructor(n, gridsize) {
		this.n = n;
		this.size = Math.pow(2, this.n) + 1
		this.gridsize = gridsize;

		this.diamondSquare();
		this.smooth(20);
		this.smooth(3);
		this.getSquareMesh(this.map, n);

		var material = new THREE.MeshPhongMaterial( { vertexColors: THREE.FaceColors, shininess: 0} );

		this.mesh = new THREE.Mesh(this.geometry, material);

		this.mesh.geometry.computeVertexNormals();

		scene.add(this.mesh);
	}

	diamondSquare() {
		const BASEMOD = 400;
		const TAPER = (modifier, step) => {
	        if (step >= this.n-3) {
	            return 0;
	        } else {
	            return modifier / 1.45;
	        };
	    };

		var modifier = BASEMOD;

		this.map = new Array(this.size);
		for (var i = 0; i < this.size; i++) {
			this.map[i] = new Array(this.size);
		}

		for (var x = 0; x < this.size; x++) {
			for (var y = 0; y < this.size; y++) {
				this.map[x][y] = 0;
			}
		}

		for (var step = 0; step < this.n; step++) {
			var squareSize = Math.pow(2, this.n - step);

			for (var square = 0; square < Math.pow(4, step); square++) {
				var topleft = [
					Math.floor(square / Math.pow(2, step)) * squareSize,
					square % Math.pow(2, step) * squareSize
				];

				var center = [topleft[0] + squareSize / 2, topleft[1] + squareSize / 2];
				var average =
					(this.map[topleft[0]][topleft[1]] +
					this.map[topleft[0] + squareSize][topleft[1]] +
					this.map[topleft[0]][topleft[1] + squareSize] +
					this.map[topleft[0] + squareSize][topleft[1] + squareSize]) / 4;

				this.map[center[0]][center[1]] = average + (random() - 0.5) * modifier;
			}

			modifier = TAPER(modifier, step);


			var point = 0;
			var gridWidth = Math.pow(2, step+1) + 1;
			var diamondSize = squareSize / 2;
			for (var x = 0; x < gridWidth; x++) {
				for (var y = 0; y < gridWidth; y++) {
					if (point % 2 == 1) {
						var mapx = x * diamondSize;
						var mapy = y * diamondSize;

						var sum = 0;
						var summedDirections = 0

						for (let direction of [[-1, 0], [0, -1], [1, 0], [0, 1]]) {
							var neighbourx = mapx + direction[0] * diamondSize;
							var neighboury = mapy + direction[1] * diamondSize;

							if (neighbourx >= 0 && neighboury >= 0 && neighbourx < this.size && neighboury < this.size) {
								sum += this.map[neighbourx][neighboury];
								summedDirections++;
							}
						}

						average = sum / summedDirections;
						this.map[mapx][mapy] = average + (random() - 0.5) * modifier;
					}
					point += 1
				}
			}

			modifier = TAPER(modifier, step);
		}


	}

	smooth(radius) {
		var max = Math.max.apply(null, this.map.map( (row) => { return Math.max.apply(Math, row); }));
		var min = Math.min.apply(null, this.map.map( (row) => { return Math.min.apply(Math, row); }));

		for (var y = 0; y < this.map.length; y++) {
			for (var x = 0; x < this.map.length; x++) {
				var sum = 0;
				var summed = 0;

				var localRadius = Math.floor(radius - ((this.map[x][y] - min) / (max - min)) * radius);

				for (var nx = -localRadius; nx <= localRadius; nx++) {
					for (var ny = -localRadius; ny <= localRadius; ny++) {
						var neighbourx = x + nx;
						var  neighboury = y + ny;

						if (neighbourx >= 0 && neighboury >= 0 &&
							neighbourx < this.map.length && neighboury < this.map.length) {
							summed += 1;
							sum += this.map[neighbourx][neighboury];
						}
					}
				}

				this.map[x][y] = sum / summed;
			}
		}
	}

	getNormal(p1, p2, p3) {
		let vx = p2.x - p1.x;
		let vy = p2.y - p1.y;
		let vz = p2.z - p1.z;
		let wx = p3.x - p1.x;
		let wy = p3.y - p1.y;
		let wz = p3.z - p1.z;

		let nx = (vy * wz) - (vz * wy);
		let ny = (vz * wx) - (vx * wz);
		let nz = (vx * wy) - (vy * wx);

		let length = Math.abs(nx) + Math.abs(ny) + Math.abs(nz);
		let ax = nx / length;
		let ay = ny / length;
		let az = nz / length;

		return new THREE.Vector3(ax, ay, az);
	}

	getSquareMesh() {
		this.geometry = new THREE.Geometry();
		var halfSize = Math.floor(this.size / 2);

		for (var x = -halfSize; x <= halfSize; x++) {
			for (var z = -halfSize; z <= halfSize; z++) {
				this.geometry.vertices.push(
					new THREE.Vector3(x*this.gridsize, this.map[x+halfSize][z+halfSize], z*this.gridsize));
			}
		}

		for (var z = 0; z < this.size - 1 ; z++) {
			for (var x = 0; x < this.size - 1; x++) {
				var base = x + z * (this.size)

				var right = base + 1
				var under = base + this.size;
				var rightUnder = base + this.size + 1;

				var color = 0x11c120;
				if (this.map[z][x] > 100) {
					color = 0x9a9a9a;
				} else if (this.map[z][x] > 75) {
					color = 0x0b5912;
				}

				this.geometry.faces.push( new THREE.Face3(
					rightUnder,
					under,
					base,
					this.getNormal(this.geometry.vertices[under],
							this.geometry.vertices[base],
							this.geometry.vertices[rightUnder]),
					new THREE.Color(color)
				));

				this.geometry.faces.push( new THREE.Face3(
					base,
					right,
					rightUnder,
					this.getNormal(this.geometry.vertices[base],
							this.geometry.vertices[right],
							this.geometry.vertices[rightUnder]),
					new THREE.Color(color)
				));
			}
		}

		this.geometry.computeBoundingSphere();
	}

	getHeightAt(x, z) {
		var bounds = Math.floor((this.size * this.gridsize) / 2)

		if (x < -bounds || x > bounds || z < -bounds || z > bounds) {
			return 0;
		}

		let gridx = x / this.gridsize;
		let gridz = z / this.gridsize;

		let v1x = Math.floor(gridx); // map two dimensional indices
		let v1z = Math.floor(gridz);

		let v2x = v1x;
		let v2z = v1z;

		let v3x = v1x + 1;
		let v3z = v1z + 1;

		let rightDist = Math.sqrt((v1x + 1 - gridx) ** 2 + (v1z - gridz) ** 2);
		let leftDist = Math.sqrt((v1x - gridx) ** 2 + (v1z + 1 - gridz) ** 2);

		if (rightDist < leftDist) {
			v2x = v1x + 1;
		} else {
			v2z = v1z + 1;
		}

		let wv1 = ((v2z - v3z) * (gridx - v3x) + (v3x - v2x) * (gridz - v3z)) /
		          ((v2z - v3z) * (v1x - v3x) + (v3x - v2x) * (v1z - v3z));

		let wv2 = ((v3z - v1z) * (gridx - v3x) + (v1x - v3x) *   (gridz - v3z)) /
		          ((v2z - v3z) * (v1x - v3x) + (v3x - v2x) * (v1z - v3z));

		let wv3 = 1 - wv1 - wv2;

		var halfSize = Math.floor(this.size / 2);
		var v1xIndex = v1x + halfSize;
		var v1zIndex = v1z + halfSize;
		var v2xIndex = v1xIndex + (rightDist < leftDist);
		var v2zIndex = v1zIndex + (rightDist >= leftDist);
		var v3xIndex = v1xIndex + 1;
		var v3zIndex = v1zIndex + 1;

		var height = wv1 * this.map[v1xIndex][v1zIndex] +
					 wv2 * this.map[v2xIndex][v2zIndex] +
					 wv3 * this.map[v3xIndex][v3zIndex];

		return height;
	}
}
