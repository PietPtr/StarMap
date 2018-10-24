class StarMap {
    constructor(inputStars) {

        // var starGeometry = new THREE.Geometry();
        //
        // for (let star of stars) {
        //     starGeometry.vertices.push(this.calculatePosition(star.ascension, star.declination));
        // }
        //
        // var starMaterial = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false, color: 0xffff00 } );
        // var starMapMesh = new THREE.Points(starGeometry, starMaterial);
        // scene.add(starMapMesh);

        this.stars = []

        for (let star of inputStars) {
            var starGeometry = new THREE.Geometry();

            var rightAscension = star.ra * Math.PI / 12;
            var declination = star.de * Math.PI / 180;

            var position = this.calculatePosition(rightAscension, declination)
            starGeometry.vertices.push(position);

            var size = (2 - star.mag) / 4 * 2 + 1.4;
            if (size < 1) {
                size = 1;
            }

            var starMaterial = new THREE.PointsMaterial( { size: size,
                sizeAttenuation: false, color: star.color || 0xffffff } );
            var starMapMesh = new THREE.Points(starGeometry, starMaterial);
            scene.add(starMapMesh);

            this.stars.push({
                mesh: starMapMesh,
                pos: position
            });
        }
    }

    calculatePosition(ascension, declination) {
        var position = new THREE.Vector3(0, 0, 400);

        var yAxis = new THREE.Vector3(0, 1, 0);
        position.applyAxisAngle(yAxis, ascension);

        var declinationAxis = position.clone().applyAxisAngle(yAxis, 1.5 * Math.PI).normalize();
        position.applyAxisAngle(declinationAxis, declination);

        return position;
    }

    updatePositions(delta) {
        for (let star of this.stars) {
            var newPos = controls.getObject().position.clone().add(star.pos);
            star.mesh.position.x = newPos.x;
            star.mesh.position.y = newPos.y;
            star.mesh.position.z = newPos.z;
        }
    }
}
