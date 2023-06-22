let keyDownArray = [];

window.addEventListener('keydown', function(e) {
    keyDownArray[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
    keyDownArray[e.keyCode] = false;
});

let gamepadArray = [];
for(let i = 0; i < 10; i++){
    gamepadArray[i] = 0;
}

window.addEventListener('gamepadconnected', (event) => {
    const update = () => {

      for (const gamepad of navigator.getGamepads()) {
        if (!gamepad) continue;
        for (const [index, axis] of gamepad.axes.entries()) {
            gamepadArray[index] = axis;
        }
      }
      requestAnimationFrame(update);
    };
    update();
});


  

function worldGrid(){
    let grid = new THREE.GridHelper( 100, 10 );
    grid.position.y = -10;
    scene.add( grid );
}


import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

let clock = new THREE.Clock();
clock.start();

const threeArea = document.getElementById('three-area');
const guiArea = document.getElementById('gui-area');

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
threeArea.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

const controls = new OrbitControls( camera, renderer.domElement );

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( -100, 100, -100 );
controls.update();

const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

worldGrid();



const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const normalMaterial = new THREE.MeshNormalMaterial(  );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


// Constants
const GRAVITY = .000981; // m/s^2
const AIR_DENSITY = 1.225; // kg/m^3
const AIR_VISCOSITY = 1.7894e-5; // kg/(m*s)



class Topography{
    constructor(params){
        this.location = {};
        this.location.position = params.position;
        this.location.rotation = params.rotation;
    }
}

class MovingObject extends Topography{
    constructor(params){
        super(
            {                
                position: params.location.position,
                rotation: params.location.rotation
            }
        );

        this.location.velocity = params.location.velocity;
        this.location.acceleration = params.location.acceleration;

        this.location.angularVelocity = params.location.rotationalVelocity;
        this.location.angularAcceleration = params.location.rotationalAcceleration;
    }
}


// controlSurface: {
//     type: "aileron",
//     side: "right",
//     chord: .5,
//     angle: 0,
//     maxAngle: 30,
// },
// liftSlope: 6.20,
// skinFriction: .02,
// zeroLiftAngle: 0.0,
// stallAngle: 15.0,

function calculateCoefficients(angleOfAttack, wing){

        if(angleOfAttack > wing.stallAngle * Math.PI / 180){
            return {liftCoefficient: 1, dragCoefficient: 1, torqueCoefficient: 1};
            console.log("stall")
        }

        let liftCoefficient = wing.liftSlope * (angleOfAttack - wing.zeroLiftAngle);

        let wingArea = wing.span * wing.chord;

        let aspectRatio = wing.span * wing.span / wingArea;

        let inducedAngle = liftCoefficient / (Math.PI * aspectRatio);

        let effectiveAngle = angleOfAttack - wing.zeroLiftAngle - inducedAngle;

        let tangentialCoefficient = wing.skinFriction * Math.cos(effectiveAngle);

        let normalCoefficient = (liftCoefficient + Math.sin(effectiveAngle) * tangentialCoefficient) / Math.cos(effectiveAngle);
        
        let dragCoefficient = normalCoefficient * Math.sin(effectiveAngle) + tangentialCoefficient * Math.cos(effectiveAngle);
        
        let torqueCoefficient = normalCoefficient * wing.chord * Math.sin(effectiveAngle);

        return {liftCoefficient, dragCoefficient, torqueCoefficient};

}

class Aircraft extends MovingObject{
    constructor(params){
        super(
            {
                location: params.location,
            }
        );
        this.parameters = params.parameters;
        this.physics = params.physics;
        this.controls = params.controls;

        // this.location.rotation.x = -Math.PI / 2;
        // this.location.rotation.y = Math.PI / 2;
        this.location.rotation.y =- Math.PI / 2;
        this.location.velocity.z = 100;

        // this.controls.throttle =1;
    }

    handleInput(frameTime){
        this.physics.thrustMagnitude = (gamepadArray[6] + 1) * 100000;
        // console.log(this.physics.thrustMagnitude)

        // this.location.rotation.z = gamepadArray[0] * Math.PI *2 ;
        // this.location.rotation.x = - gamepadArray[1] * Math.PI *2;
        // this.location.rotation.y = - gamepadArray[5] * Math.PI *2;

        // this.physics.thrustMagnitude +=  this.physics.thrustMagnitude

        // console.log(this.controls.thrustMagnitude);
    }

    update(frameTime){
        this.handleInput(frameTime);

        if(this.location.position.y > 100){
            this.location.position.y = 0;
        }
        if(this.location.position.x > 100){
            this.location.position.x = 0;
        }
        if(this.location.position.z > 100){
            this.location.position.z = 0;
        }

        
        this.location.position.x += this.location.velocity.x * frameTime;
        this.location.position.y += this.location.velocity.y * frameTime;
        this.location.position.z += this.location.velocity.z * frameTime;

        this.location.velocity.x += this.location.acceleration.x * frameTime;
        this.location.velocity.y += this.location.acceleration.y * frameTime;
        this.location.velocity.z += this.location.acceleration.z * frameTime;
        
        this.location.rotation.x += this.location.angularVelocity.x * frameTime;
        this.location.rotation.y += this.location.angularVelocity.y * frameTime;
        this.location.rotation.z += this.location.angularVelocity.z * frameTime;

        if(this.location.rotation.x > 2 * Math.PI){
            this.location.rotation.x -= 2 * Math.PI;
        }else if(this.location.rotation.x < 0){
            this.location.rotation.x += 2 * Math.PI;
        }

        if(this.location.rotation.y > 2 * Math.PI){
            this.location.rotation.y -= 2 * Math.PI;
        }else if(this.location.rotation.y < 0){
            this.location.rotation.y += 2 * Math.PI;
        }

        if(this.location.rotation.z > 2 * Math.PI){
            this.location.rotation.z -= 2 * Math.PI;
        }else if(this.location.rotation.z < 0){
            this.location.rotation.z += 2 * Math.PI;
        }

        this.location.angularVelocity.x += this.location.angularAcceleration.x * frameTime;
        this.location.angularVelocity.y += this.location.angularAcceleration.y * frameTime;
        this.location.angularVelocity.z += this.location.angularAcceleration.z * frameTime;

        this.location.acceleration.x = this.physics.lift.x / this.parameters.mass  + this.physics.thrust.x / this.parameters.mass + this.physics.weight.x - this.physics.drag.x / this.parameters.mass ;
        this.location.acceleration.y = this.physics.lift.y / this.parameters.mass  + this.physics.thrust.y / this.parameters.mass + this.physics.weight.y - this.physics.drag.y / this.parameters.mass ;
        this.location.acceleration.z = this.physics.lift.z / this.parameters.mass  + this.physics.thrust.z / this.parameters.mass + this.physics.weight.z - this.physics.drag.z / this.parameters.mass ;

        console.log(this.physics.drag)
        console.log(this.physics.lift)


        this.physics.thrust.z = this.physics.thrustMagnitude * Math.cos(this.location.rotation.x) * Math.cos(this.location.rotation.y);        
        this.physics.thrust.y = -1* this.physics.thrustMagnitude * Math.sin(this.location.rotation.x) * Math.cos(this.location.rotation.y);
        this.physics.thrust.x = this.physics.thrustMagnitude * Math.sin(this.location.rotation.y);
        
        
        this.physics.weight.y = - this.parameters.mass * GRAVITY;

        let dragCoefficient = 0.8;
        let referenceArea = 1;

        this.physics.drag.x = 0.5 * AIR_DENSITY * this.location.velocity.x ** 2 * dragCoefficient * referenceArea;
        this.physics.drag.y = 0.5 * AIR_DENSITY * this.location.velocity.y ** 2 * dragCoefficient * referenceArea;
        this.physics.drag.z = 0.5 * AIR_DENSITY * this.location.velocity.z ** 2 * dragCoefficient * referenceArea;

        console.log(this.physics.dragMagnitude)

        
        let airspeed = Math.sqrt(
            this.location.velocity.x ** 2 +
            this.location.velocity.y ** 2 +
            this.location.velocity.z ** 2
        );

        let angleOfAttack = Math.atan2(this.location.velocity.z, this.location.velocity.x);


        let dynamicPressure = .5 * AIR_DENSITY * airspeed ** 2;


        let lift = {
            x: 0,
            y: 0,
            z: 0,
        }

        for(let wing of this.parameters.wings){
            if(wing.liftSlope != null){
                // console.log(wing);
                let aerodynamicCoefficient = calculateCoefficients(angleOfAttack, wing);

                let liftDirection = {
                    x: Math.sin(angleOfAttack),
                    y: 0,
                    z: Math.cos(angleOfAttack),
                }
                
                let dragDirection = {
                    x: Math.cos(angleOfAttack),
                    y: 0,
                    z: -Math.sin(angleOfAttack),
                }

                let lift = {
                    y: dynamicPressure * wing.chord * wing.span * aerodynamicCoefficient.liftCoefficient * liftDirection.x,
                    x: dynamicPressure * wing.chord * wing.span * aerodynamicCoefficient.liftCoefficient * liftDirection.y,
                    z: dynamicPressure * wing.chord * wing.span * aerodynamicCoefficient.liftCoefficient * liftDirection.z,
                }

                let drag = {
                    y: dynamicPressure  * wing.chord * wing.span * aerodynamicCoefficient.dragCoefficient * dragDirection.x,
                    x: dynamicPressure  * wing.chord * wing.span * aerodynamicCoefficient.dragCoefficient * dragDirection.y,
                    z: dynamicPressure  * wing.chord * wing.span * aerodynamicCoefficient.dragCoefficient * dragDirection.z,
                }

                let torque = {
                    x: aerodynamicCoefficient.torqueCoefficient * dynamicPressure * wing.area * wing.chord * wing.chord * wing.span * liftDirection.x,

                }

                this.physics.lift = lift;
                this.physics.wingDrag = drag;

                // console.log(lift);
                // console.log(aerodynamicCoefficient.dragCoefficient);
                // // console.log(torque)

                // console.log(aerodynamicCoefficient);

            }
        }
        
        
        // let airspeed;
        // if(this.velocity.x == 0 && this.velocity.y == 0 && this.velocity.z == 0){
        //     airspeed = 0;
        // }else{
        //     airspeed = Math.sqrt(
        //         this.velocity.x ** 2 +
        //         this.velocity.y ** 2 +
        //         this.velocity.z ** 2
        //     );
        // }

        // console.log(airspeed)

        // let lift = .5 * AIR_DENSITY * airspeed ** 2 * this.parameters.liftCoefficient **2;
        // let drag = .5 * AIR_DENSITY * airspeed ** 2 * this.parameters.dragCoefficient **2;

        // let dragVector = {
        //     x: -drag * this.velocity.x / airspeed,
        //     y: -drag * this.velocity.y / airspeed,
        //     z: -drag * this.velocity.z / airspeed,
        // }

        // let thrustVector = {
        //     x: this.controls.throttle *100 * this.parameters.thrustCoefficient * Math.cos(this.rotation.x),
        //     y: this.controls.throttle *100 * this.parameters.thrustCoefficient * Math.cos(this.rotation.y),
        //     z: this.controls.throttle *100 * this.parameters.thrustCoefficient * Math.cos(this.rotation.z)        
        // }

        // this.acceleration.x = (thrustVector.x + dragVector.x) / this.parameters.mass;
        // this.acceleration.y = (thrustVector.y + dragVector.y) / this.parameters.mass;
        // this.acceleration.z = (thrustVector.z + dragVector.z) / this.parameters.mass;

    }
}

let testAircraft = 
    new Aircraft(
        {
            location:{
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                velocity: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                acceleration: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotationalVelocity: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotationalAcceleration: {
                    x: 0,
                    y: 0,
                    z: 0,
                }
            },
            physics:{
                thrustMagnitude: 0,
                thrust:{
                    x: 0,
                    y: 0,
                    z: 0,
                },
                lift:{
                    x: 0,
                    y: 0,
                    z: 0,
                },
                drag:{
                    x: 0,
                    y: 0,
                    z: 0,
                },
                weight:{
                    x: 0,
                    y: 0,
                    z: 0,
                },
            },
            controls: {
                throttle: 0,
                elevator: 0,
                aileron: 0,
                rudder: 0,
                flap: 0,
            },
            parameters: {
                mass: 10000,
                centerOfMass: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                fuselage: {
                    diameter: 1,
                    length: 10,
                },
                wings: [
                    {
                        span: 2,
                        chord: 2,
                        position: {
                            x: 1,
                            y: 0,
                            z: 0,
                        },
                        angle: {
                            x: 0,
                            y: 0,
                            z: 0,
                        }       
                    },
                    {
                        span: 2,
                        chord: 2,
                        position: {
                            x: -1,
                            y: 0,
                            z: 0,
                        },
                        angle: {
                            x: 0,
                            y: 0,
                            z: 0,
                        }                 
                    },
                    {
                        span: 2,
                        chord: 1.5,
                        position: {
                            x: 3,
                            y: 0,
                            z: .25,
                        },
                        angle: {
                            x: 0,
                            y: 0,
                            z: 0,
                        },
                        controlSurface: {
                            type: "flap",
                            chord: .5,
                            angle: 0,
                            maxAngle: 30,
                        }
                    },
                    {
                        span: 2,
                        chord: 1.5,
                        position: {
                            x: -3,
                            y: 0,
                            z: .25,
                        },
                        angle: {
                            x: 0,
                            y: 0,
                            z: 0,
                        },
                        controlSurface: {
                            type: "flap",
                            chord: .5,
                            angle: 0,
                            maxAngle: 30,
                        }
                    },
                    {
                        span: 2,
                        chord: 1.25,
                        position: {
                            x: 5,
                            y: 0,
                            z: .35,
                        },
                        angle: {
                            x: 0,
                            y: 0,
                            z: 0,
                        },
                        controlSurface: {
                            type: "aileron",
                            side: "left",
                            chord: .5,
                            angle: 0,
                            maxAngle: 30,
                        },
                        liftSlope: 6,
                        skinFriction: .02,
                        zeroLiftAngle: 0.0,
                        stallAngle: 15.0,
                    },
                    {
                        span: 2,
                        chord: 1.25,
                        position: {
                            x: -5,
                            y: 0,
                            z: .35,
                        },
                        angle: {
                            x: 0,
                            y: 0,
                            z: 0,
                        },
                        controlSurface: {
                            type: "aileron",
                            side: "right",
                            chord: .5,
                            angle: 0,
                            maxAngle: 30,
                        },
                        liftSlope: 6,
                        skinFriction: .02,
                        zeroLiftAngle: 0.0,
                        stallAngle: 15.0,
                    }
                ],
                elevators: [
                    {

                    }
                ],
                engine:{
                    maxThrust: 1000,
                },
                liftCoefficient: 1,
                dragCoefficient: .029,
                thrustCoefficient: .029,
            }
        }
    );


function menuControls(){
    let nav = document.getElementById("gui-nav");

    // <button class = "gui-nav-button" id="gui-nav-button-location">Location</button>
    // <button class = "gui-nav-button" id="gui-nav-button-properties">Properties</button>
    // <button class = "gui-nav-button" id="gui-nav-button-properties">Controls</button>

    // <div id = "gui-content-location"></div>
    // <div id = "gui-content-properties"></div>
    // <div id = "gui-content-controls"></div>

    let navButtons = document.getElementsByClassName("gui-nav-button");
    let contentAreas = document.getElementsByClassName("gui-content-area");


}


let outputText = {};

function updateLocationMenu(object, element, parentName){
    for(let key in object){
        let inputArea = document.createElement("div");
        inputArea.innerHTML = key;
        element.appendChild(inputArea);
        if(typeof object[key] == "object"){
            outputText[key] = {};
            updateLocationMenu(object[key], inputArea, key);
        }
        else{
            let inputRange = document.createElement("input");
            inputRange.type = "range";
            inputRange.step = 1;
            inputRange.min = -10;
            inputRange.max = 10;
            inputRange.value = object[key];
            inputRange.id = parentName + "-" + key + "-range";

            inputArea.appendChild(inputRange);

            let inputBox = document.createElement("input");
            inputBox.type = "number";
            inputBox.step = 1;
            inputBox.min = -10;
            inputBox.max = 10;
            inputBox.value = object[key];
            inputBox.id = parentName + "-" + key + "-input";

            inputArea.appendChild(inputBox);

            inputRange.addEventListener("input", function(){
                inputBox.value = inputRange.value;
                object[key] = inputRange.value * inputRange.step;
            })

            inputBox.addEventListener("input", function(){
                inputRange.value = inputBox.value;
                object[key] = inputBox.value * inputBox.step;
            })

            let resetButton = document.createElement("button");
            resetButton.innerHTML = "Reset";
            resetButton.addEventListener("click", function(){
                inputRange.value = 0;
                inputBox.value = 0;
                object[key] = 0;
            })
            inputArea.appendChild(resetButton);
            
            let currentValue = document.createElement("span");
            currentValue.innerHTML = object[key];
            currentValue.id = parentName + "-" + key + "-value";
            inputArea.appendChild(currentValue);
            outputText[parentName][key] = currentValue;
        }
    }
}

function updateControlsMenu(object, element, parentName){
    for(let key in object){
        let inputArea = document.createElement("div");
        inputArea.innerHTML = key;
        element.appendChild(inputArea);
        if(typeof object[key] == "object"){
            updateControlsMenu(object[key], inputArea, key);
        }
        else{
            let inputRange = document.createElement("input");
            inputRange.type = "range";
            inputRange.step = Math.PI/100;
            inputRange.min = -Math.PI / 2;
            inputRange.max = Math.PI / 2;
            inputRange.value = object[key];
            inputRange.id = parentName + "-" + key + "-range";

            inputArea.appendChild(inputRange);

            let inputBox = document.createElement("input");
            inputBox.type = "number";
            inputBox.step = Math.PI/100;
            inputBox.min = -Math.PI / 2;
            inputBox.max = Math.PI / 2;
            inputBox.value = object[key];
            inputBox.id = parentName + "-" + key + "-input";

            inputArea.appendChild(inputBox);

            inputRange.addEventListener("input", function(){
                inputBox.value = inputRange.value;
                object[key] = inputRange.value ;
            })

            inputBox.addEventListener("input", function(){
                inputRange.value = inputBox.value;
                object[key] = inputBox.value ;
            })

            let resetButton = document.createElement("button");
            resetButton.innerHTML = "Reset";
            resetButton.addEventListener("click", function(){
                inputRange.value = 0;
                inputBox.value = 0;
                object[key] = 0;
            })
            inputArea.appendChild(resetButton);
        }
    }
}


function resetValues(object, parentName){
    for(let key in object){
        if(typeof object[key] == "object"){
            resetValues(object[key], key);
        }
        else{
            object[key] = 0;
            document.getElementById(parentName + "-" + key + "-range").value = 0;
            document.getElementById(parentName + "-" + key + "-input").value = 0;
        }
    }
}

function updateInterface(object, parentName){
    for(let key in object){
        if(object[key] instanceof Element){
            document.getElementById(parentName + "-" + key + "-input").value = testAircraft.location[parentName][key].toFixed(3);
            object[key].innerHTML = testAircraft.location[parentName][key].toFixed(3);
        }
        else if(typeof object[key] == "object"){
            updateInterface(object[key], key), parentName;
        }
    }
}

updateInterface(outputText);

function createLocationMenu (object, element){
    let inputTitle = document.createElement("div");
    inputTitle.innerHTML = "Location";
    element.appendChild(inputTitle);

    updateLocationMenu(object, element);

    let resetLocationButton = document.createElement("button");
    resetLocationButton.innerHTML = "Reset All";
    resetLocationButton.addEventListener("click", function(){
        resetValues(object, "location");
    })

    element.appendChild(resetLocationButton);
}

function createControlsMenu (object, element){

    let inputTitle = document.createElement("div");
    inputTitle.innerHTML = "Controls";
    element.appendChild(inputTitle);

    updateControlsMenu(object, element, "controls");

}

function addGUI(){
    let guiArea = document.getElementById("guiArea");
    let guiNav = document.getElementById("guiNav");

    let guiContentLocation = document.getElementById("gui-content-location");
    let guiContentCharacteristics = document.getElementById("gui-content-parameters");
    let guiContentControls = document.getElementById("gui-content-controls");

    createLocationMenu(testAircraft.location, guiContentLocation);

    createControlsMenu(testAircraft.controls, guiContentControls);

    // createLocationMenu(testAircraft.parameters, guiContentProperties);

}

addGUI();

const aircraft = testAircraft;

const airCraftModel = {};

const aircraftGeometry = new THREE.Group();
const aircraftAxesHelper = new THREE.AxesHelper(10);
aircraftGeometry.add(aircraftAxesHelper);

airCraftModel.aircraftGeometry = aircraftGeometry;
scene.add(airCraftModel.aircraftGeometry);

const fuselageGeometry  = new THREE.BoxGeometry(aircraft.parameters.fuselage.diameter, aircraft.parameters.fuselage.diameter, aircraft.parameters.fuselage.length, 32);
const fuselageObject = new THREE.Mesh(fuselageGeometry, normalMaterial);
aircraftGeometry.add(fuselageObject);

scene.add(airCraftModel.aircraftGeometry);

airCraftModel.aircraftGeometry.controlSurfaces = {
    ailerons: [],
    elevators: [],
    rudder: [],
    flaps: [],
    slats: []
}

for(let wing of aircraft.parameters.wings){
    const wingGeometry = new THREE.BoxGeometry(wing.span, .1, wing.chord);
    const wingObject = new THREE.Mesh(wingGeometry, normalMaterial);
    wingObject.position.x = wing.position.x;
    wingObject.position.y = wing.position.y;
    wingObject.position.z = wing.position.z;
    airCraftModel.aircraftGeometry.add(wingObject);

    if(wing.controlSurface){
        const controlSurfaceGroup = new THREE.Group();
        const controlSurfaceGeometry = new THREE.BoxGeometry(wing.span, .1, wing.controlSurface.chord);
        const controlSurfaceObject = new THREE.Mesh(controlSurfaceGeometry, normalMaterial);
        
        controlSurfaceObject.position.z -=  wing.controlSurface.chord/2;

        controlSurfaceGroup.position.x = wing.position.x;
        controlSurfaceGroup.position.y = wing.position.y;
        controlSurfaceGroup.position.z = wing.position.z - wing.chord/2;

        if(wing.controlSurface.side){
            controlSurfaceGroup.side = wing.controlSurface.side;
        }

        controlSurfaceGroup.add(controlSurfaceObject);

        airCraftModel.aircraftGeometry.add(controlSurfaceGroup);

        if(wing.controlSurface.type == "aileron"){
            airCraftModel.aircraftGeometry.controlSurfaces.ailerons.push(controlSurfaceGroup);
        }
        else if(wing.controlSurface.type == "elevator"){
            airCraftModel.aircraftGeometry.controlSurfaces.elevators.push(controlSurfaceGroup);
        }
        else if(wing.controlSurface.type == "rudder"){
            airCraftModel.aircraftGeometry.controlSurfaces.rudder.push(controlSurfaceGroup);
        }
        else if(wing.controlSurface.type == "flap"){
            airCraftModel.aircraftGeometry.controlSurfaces.flaps.push(controlSurfaceGroup);
        }
        else if(wing.controlSurface.type == "slat"){
            airCraftModel.aircraftGeometry.controlSurfaces.slats.push(controlSurfaceGroup);
        }
    }
}


function updatePhysics(){
      
    // if(keyDownArray[87]){
    //     testAircraft.controls.throttle += 10;
    // }
    
    // if(keyDownArray[83]){
    //     testAircraft.controls.throttle -= 10;
    // }
    
    // if(keyDownArray[37]){
    //     testAircraft.rotation.x -= .1;
    // }
    
    // if(keyDownArray[39]){
    //     testAircraft.rotation.x += .1;
    // }

    // if(keyDownArray["W".charCodeAt(0)]){
    //     testAircraft.position.z += 1;
    // }

    // if(keyDownArray["S".charCodeAt(0)]){
    //     testAircraft.position.z -= 1;
    // }

    // if(keyDownArray["A".charCodeAt(0)]){
    //     testAircraft.position.x += 1;
    // }

    // if(keyDownArray["D".charCodeAt(0)]){
    //     testAircraft.position.x -= 1;
    // }

    // console.log(gamepadArray)


    testAircraft.update(clock.getDelta());

    updateInterface(outputText);


    window.requestAnimationFrame(updatePhysics);

    clock.elapsedTime = 0;

}
window.requestAnimationFrame(updatePhysics);



function animate() {
	requestAnimationFrame( animate );

	aircraftGeometry.position.x = testAircraft.location.position.x;
	aircraftGeometry.position.y = testAircraft.location.position.y;
    aircraftGeometry.position.z = testAircraft.location.position.z;

    aircraftGeometry.rotation.x = testAircraft.location.rotation.x;
    aircraftGeometry.rotation.y = testAircraft.location.rotation.y;
    aircraftGeometry.rotation.z = testAircraft.location.rotation.z;

    for(let aileron of airCraftModel.aircraftGeometry.controlSurfaces.ailerons){
        if(aileron.side == "left"){
            aileron.rotation.x = testAircraft.controls.aileron;
        }
        else{
            aileron.rotation.x = -testAircraft.controls.aileron;

        }
    }

    for(let flap of airCraftModel.aircraftGeometry.controlSurfaces.flaps){
        flap.rotation.x = testAircraft.controls.flap;
    }



    controls.update();

	renderer.render( scene, camera );
}

animate();