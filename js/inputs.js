export const inputs = {
    mouseX: 0,
    mouseY: 0,
    keyDownArray: [],
}
const keyDownArray = [];

window.addEventListener('keydown', function(e) {
    inputs.keyDownArray[e.keyCode] = true;

});

window.addEventListener('keyup', function(e) {
    inputs.keyDownArray[e.keyCode] = false;

});

window.addEventListener('mousemove', function(e) {
    inputs.mouseX = e.clientX;
    inputs.mouseY = e.clientY;
});

