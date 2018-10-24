var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var onKeyDown = (event) => {
    switch (event.keyCode) {
        case 38:
            moveForward = true; break;
        case 37:
            moveLeft = true; break;
        case 40:
            moveBackward = true; break;
        case 39:
            moveRight = true; break;
    }
}

var onKeyUp = (event) => {
    switch (event.keyCode) {
        case 38:
            moveForward = false; break;
        case 37:
            moveLeft = false; break;
        case 40:
            moveBackward = false; break;
        case 39:
            moveRight = false; break;
    }
}

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

function updatePlayerPosition(delta) {
    // console.log(moveForward, moveLeft, moveBackward, moveRight);
    SPEED = 40;

    if (moveForward) {
        controls.getObject().translateZ(-SPEED * delta);
    }
    if (moveBackward) {
        controls.getObject().translateZ(SPEED * delta);
    }
    if (moveLeft) {
        controls.getObject().translateX(-SPEED * delta);
    }
    if (moveRight) {
        controls.getObject().translateX(SPEED * delta);
    }

    let objPos = controls.getObject().position;
    let y = landscape.getHeightAt(objPos.x, objPos.z);
    controls.getObject().translateY(y - objPos.y + 2);
    // console.log(objPos, y);

}
