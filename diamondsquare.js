function diamondSquare(n) {
    console.log("dimand");
	const BASEMOD = 400;
	const TAPER = (modifier, step) => {
        if (step >= n-3) {
            return 0;
        } else {
            return modifier / 1.45;
        };
    };

	var size = Math.pow(2, n) + 1
	var modifier = BASEMOD;

	var map = new Array(size);
	for (var i = 0; i < size; i++) {
		map[i] = new Array(size);
	}

	for (var x = 0; x < size; x++) {
		for (var y = 0; y < size; y++) {
			map[x][y] = 0;
		}
	}

	for (var step = 0; step < n; step++) {
		var squareSize = Math.pow(2, n - step);

		for (var square = 0; square < Math.pow(4, step); square++) {
			var topleft = [
				Math.floor(square / Math.pow(2, step)) * squareSize,
				square % Math.pow(2, step) * squareSize
			];

			var center = [topleft[0] + squareSize / 2, topleft[1] + squareSize / 2];
			var average =
				(map[topleft[0]][topleft[1]] +
				map[topleft[0] + squareSize][topleft[1]] +
				map[topleft[0]][topleft[1] + squareSize] +
				map[topleft[0] + squareSize][topleft[1] + squareSize]) / 4;

			map[center[0]][center[1]] = average + (random() - 0.5) * modifier;
		}

		modifier = TAPER(modifier, step);


		var point = 0;
		var gridWidth = Math.pow(2, step+1) + 1;
		var diamondSize = squareSize / 2;
		for (var x = 0; x < gridWidth; x++) {
			for (var y = 0; y < gridWidth; y++) {
				if (point % 2 == 1) {
					mapx = x * diamondSize;
					mapy = y * diamondSize;

					sum = 0;
					summedDirections = 0

					for (let direction of [[-1, 0], [0, -1], [1, 0], [0, 1]]) {
						neighbourx = mapx + direction[0] * diamondSize;
						neighboury = mapy + direction[1] * diamondSize;

						if (neighbourx >= 0 && neighboury >= 0 && neighbourx < size && neighboury < size) {
							sum += map[neighbourx][neighboury];
							summedDirections++;
						}
					}

					average = sum / summedDirections;
					map[mapx][mapy] = average + (random() - 0.5) * modifier;
				}
				point += 1
			}
		}

		modifier = TAPER(modifier, step);
	}

	return map
}

function smooth(map, radius) {
	var max = Math.max.apply(null, map.map( (row) => { return Math.max.apply(Math, row); }));
	var min = Math.min.apply(null, map.map( (row) => { return Math.min.apply(Math, row); }));

	for (var y = 0; y < map.length; y++) {
		for (var x = 0; x < map.length; x++) {
			var sum = 0;
			var summed = 0;

			localRadius = Math.floor(radius - ((map[x][y] - min) / (max - min)) * radius);

			for (var nx = -localRadius; nx <= localRadius; nx++) {
				for (var ny = -localRadius; ny <= localRadius; ny++) {
					neighbourx = x + nx;
					neighboury = y + ny;

					if (neighbourx >= 0 && neighboury >= 0 &&
						neighbourx < map.length && neighboury < map.length) {
						summed += 1;
						sum += map[neighbourx][neighboury];
					}
				}
			}

			map[x][y] = sum / summed;
		}
	}

	return map;
}

function getNormal(p1, p2, p3) {
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

function getSquareMesh(map, n) {
	var size = Math.pow(2, n-1)
	var geometry = new THREE.Geometry();

	for (var x = -size; x <= size; x++) {
		for (var z = -size; z <= size; z++) {
			geometry.vertices.push(new THREE.Vector3(x, map[x+size][z+size], z));
		}
	}

	for (var z = 0; z < size*2; z++) {
		for (var x = 0; x < size*2; x++) {
			var base = x + z * (size * 2 + 1)

			right = base + 1
			under = base + size * 2 + 1;
			rightUnder = base + size * 2 + 2;

			color = 0x11c120;
			if (map[z][x] > 100) {
				color = 0x9a9a9a;
			} else if (map[z][x] > 75) {
				color = 0x0b5912;
			}

			geometry.faces.push( new THREE.Face3(
				rightUnder,
				under,
				base,
				getNormal(geometry.vertices[under], geometry.vertices[base], geometry.vertices[rightUnder]),
				new THREE.Color(color)
			));

			geometry.faces.push( new THREE.Face3(
				base,
				right,
				rightUnder,
				getNormal(geometry.vertices[base], geometry.vertices[right], geometry.vertices[rightUnder]),
				new THREE.Color(color)
			))
		}
	}

	geometry.computeBoundingSphere();
	return geometry;
}
