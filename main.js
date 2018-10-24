
//////////////////////////////////////////////////////////////////////////////////
//		Initialisation
//////////////////////////////////////////////////////////////////////////////////

var renderer = new THREE.WebGLRenderer({
    antialias: false,
});
renderer.setClearColor(new THREE.Color('#0c0c0c'), 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Array of functions for the rendering loop
var onRenderFcts = [];

// Initialise scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

var controls = new THREE.PointerLockControls(camera);
scene.add(controls.getObject());
controls.getObject().translateY(-10);
controls.getObject().rotateY(-Math.PI * 0.5);

document.body.addEventListener( 'click', function ( event ) {
    controls.lock();
}, false );

//////////////////////////////////////////////////////////////////////////////////
//		Scene setup
//////////////////////////////////////////////////////////////////////////////////

// Sphere shows 30 segments, so 6 degrees per segment (180 / 30 = 6)
var sphereGeometry = new THREE.SphereGeometry( 15, 30, 30 );
var geometry = new THREE.EdgesGeometry(sphereGeometry);
var material = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 1});
var wireframe = new THREE.LineSegments(geometry, material);
// scene.add(wireframe);

var stars = new StarMap(STARS.hipstars);
var sky = new Sky(SKY_CURVES);
var landscape = new Landscape(9, 2);

//////////////////////////////////////////////////////////////////////////////////
//		Rendering
//////////////////////////////////////////////////////////////////////////////////

window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}, false);

onRenderFcts.push(function(){
    renderer.render( scene, camera );
});

onRenderFcts.push(updatePlayerPosition);

onRenderFcts.push((delta) => {
    sky.update(delta);
    stars.updatePositions(delta);
});


var lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){
    requestAnimationFrame(animate);

    lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;

    onRenderFcts.forEach(function(onRenderFct){
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
    });
});
