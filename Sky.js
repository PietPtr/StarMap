const SKY_CURVES = {
    0: {r: 100, g: 70, b: 50},
    45: {r: 40, g: 65, b: 95},
    90: {r: 67, g: 68, b: 100}, 	// Noon
    135: {r: 40, g: 65, b: 95},
    180: {r: 100, g: 70, b: 40},	// Sundown
    225: {r: 2, g: 2, b: 15},
    270: {r: 0, g: 0, b: 10},		// Midnight
    315: {r: 2, g: 2, b: 15},
    360: {r: 100, g: 70, b: 50}		// Sunrise
}

// Manages the background clear color to make the sky change according to light curves and the position of a sun
class Sky {
    constructor(curves) {
        this.curves = curves;

        this.time = 0;

        this.sun = new Celestial(5, 0xffffaa, 24, 26, 0xffffcc, 0.8, false);
        this.moon = new Celestial(5.1, 0xffffff, 25, 13, 0xffffff, 0.1, true);

    }

    update(delta) {
        this.time += delta * 0.1;

        this.sun.move(this.time);
        this.moon.move(this.time);
        this.moon.illuminate(this.sun.angle);

        this.updateSky(delta);
    }

    updateSky(delta) {
        var sunAngle = this.sun.angle * 180/Math.PI
        var lower = Math.floor(sunAngle / 45) * 45;
        var upper = Math.ceil(sunAngle / 45) * 45;

        var r = this.curves[lower].r + (sunAngle - lower) * ((this.curves[upper].r - this.curves[lower].r) / (upper - lower));
        var g = this.curves[lower].g + (sunAngle - lower) * ((this.curves[upper].g - this.curves[lower].g) / (upper - lower));
        var b = this.curves[lower].b + (sunAngle - lower) * ((this.curves[upper].b - this.curves[lower].b) / (upper - lower));

        var skyColor = ((Math.floor(r / 100 * 255) << 16) +
                    (Math.floor(g / 100 * 255) << 8) +
                    (Math.floor(b / 100 * 255)));

        renderer.setClearColor(new THREE.Color("rgb(" + Math.floor(r) + "%, " + Math.floor(g) + "%, " + Math.floor(b) + "%)"));
    }
}

class Celestial {
	constructor(size, color, period, epoch, lightColor, lightIntensity, hasShadow) {
		this.period = period;
		// this.tilt = tilt;
		this.epoch = epoch;
		this.size = size
		this.BASEINTENSITY = lightIntensity;
		// this.hasShadow = hasShadow;

        // use point with texture probably?
		var geometry = new THREE.SphereGeometry(size, 15, 15);
		var material = new THREE.MeshBasicMaterial( {color: color} );
		this.celestial = new THREE.Mesh( geometry, material );
		scene.add(this.celestial);

		this.light = new THREE.DirectionalLight( lightColor, lightIntensity );
		scene.add(this.light);

		this.target = new THREE.Object3D();
		scene.add(this.target);
		this.target.position.set(0, 1, 0);

		this.light.position.set(0, 0, 0);

		this.light.target = this.target;

	};

	move(time) {
		this.angle = ((this.epoch + time) % this.period) / this.period * Math.PI * 2;

		this.target.position.x = Math.cos(-this.angle);
		this.target.position.y = Math.sin(-this.angle);
		this.target.position.z = Math.sin(this.angle) * 0.5;

		this.celestial.position.x = -this.target.position.x * 400;
		this.celestial.position.y = -this.target.position.y * 400;
		this.celestial.position.z = -this.target.position.z * 400;
	}

	illuminate(sunAngle) {
		this.light.intensity = Math.abs(this.angle - sunAngle) / Math.PI * this.BASEINTENSITY;
	}
}
