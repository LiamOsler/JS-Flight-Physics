import { inputs } from 'inputs';

import { World, Topography, MovingObject, Ball, Bow, Arrow } from 'world';

import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';


const clock = new THREE.Clock();
clock.start();

const threeArea = document.getElementById('three-area');
const guiArea = document.getElementById('gui-area');

const renderer = new THREE.WebGLRenderer( );
renderer.setSize( window.innerWidth, window.innerHeight );
threeArea.appendChild( renderer.domElement );

const scene = new THREE.Scene( );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
camera.up.set(0,0,1);

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.set( 100, 100, 100 );
controls.update();

const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );


// const grid = new THREE.GridHelper( 100, 10 );
// grid.rotation.x = Math.PI / 2;
// grid.position.z = -1
// scene.add( grid );

const light = new THREE.DirectionalLight( 0xffffff, .1 );
light.position.set( 0, 0, 100 );
scene.add( light );

const light2 = new THREE.DirectionalLight( 0xffffff, 1 );
light2.position.set( 50, 0, 100 );
scene.add( light2 );



const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );


let targetParameters ={
    position: {x: -1000, y: 0, z: 0},
}


const normalMaterial = new THREE.MeshNormalMaterial(  );
const shadedMaterial = new THREE.MeshPhongMaterial( { color: 0x333333 } );
const ballGeometry = new THREE.SphereGeometry( 1, 32, 32 );

const targetGroup = new THREE.Group();

const targetGeometry = new THREE.CylinderGeometry( 5, 5, 1, 32 );
const targetMaterial = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
const target = new THREE.Mesh( targetGeometry, targetMaterial );
targetGroup.add( target );

const targetGeometry2 = new THREE.CylinderGeometry( 10, 10, 1, 32 );
const targetMaterial2 = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
const target2 = new THREE.Mesh( targetGeometry2, targetMaterial2 );
target2.position.y = 1;
targetGroup.add( target2 );

const targetGeometry3 = new THREE.CylinderGeometry( 15, 15, 1, 32 );
const targetMaterial3 = new THREE.MeshPhongMaterial( { color: 0x0000ff } );
const target3 = new THREE.Mesh( targetGeometry3, targetMaterial3 );
target3.position.y = 2;
targetGroup.add( target3 );

const targetGeometry4 = new THREE.CylinderGeometry( 20, 20, 1, 32 );
const targetMaterial4 = new THREE.MeshPhongMaterial( { color: 0x00000 } );
const target4 = new THREE.Mesh( targetGeometry4, targetMaterial4 );
target4.position.y = 3;
targetGroup.add( target4 );

const targetGeometry5 = new THREE.CylinderGeometry( 25, 25, 1, 32 );
const targetMaterial5 = new THREE.MeshPhongMaterial( { color: 0xffffff } );
const target5 = new THREE.Mesh( targetGeometry5, targetMaterial5 );
target5.position.y = 4;
targetGroup.add( target5 );

scene.add( targetGroup );

targetGroup.position.x = -1000;
targetGroup.rotation.z = Math.PI / 2;





const plane = new THREE.Mesh(
    new THREE.PlaneGeometry( 10000, 10000, 100, 100 ), shadedMaterial);
plane.rotation.z = Math.PI / 2;
plane.position.z = -80
scene.add( plane );

const plane2 = new THREE.Mesh(
    new THREE.PlaneGeometry( 10000, 10000, 100, 100 ), shadedMaterial);
plane2.rotation.y = Math.PI / 2;
plane2.position.x = -1100
scene.add( plane2 );



let world = new World( clock );
world.meshes = [];


let testBall = new Ball(
    {
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
        angularVelocity: {
            x: 0,
            y: 0,
            z: 0,
        },
        angularAcceleration: {
            x: 0,
            y: 0,
            z: 0,
        },
    }
);
world.addObject( testBall );
const testBallMesh = new THREE.Mesh( ballGeometry, normalMaterial );
world.meshes.push( testBallMesh );

// for(let i = 0; i < 100; i++){
//     let newBall = new Ball(
//         {
//             position: {
//                 x: i *10,
//                 y: 0,
//                 z: 0,
//             },
//             velocity: {
//                 x: 0,
//                 y: 0,   
//                 z: 0,
//             },
//             acceleration: {
//                 x: 0,
//                 y: 0,   
//                 z: 0,
//             },
//             rotation: {
//                 x: 0,
//                 y: 0,
//                 z: 0,
//             },
//             angularVelocity: {
//                 x: 0,
//                 y: 0,
//                 z: 0,
//             },
//             angularAcceleration: {
//                 x: 0,
//                 y: 0,
//                 z: 0,
//             },
//         }
//     );

//     world.addObject( newBall );
//     const newBallMesh = new THREE.Mesh( ballGeometry, normalMaterial );

//     world.meshes.push( newBallMesh );
// }


let testBow = new Bow(
    {
        position: {
            x: 0,
            y: 0,
            z: 0,
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0,
        }
    }
);
world.addObject( testBow );

const bowGroup = new THREE.Group( );


const BowAxisHelper = new THREE.AxesHelper( 50 );
bowGroup.add( BowAxisHelper );


world.meshes.push( bowGroup );

var numPoints = 100;

var topStart = new THREE.Vector3(0, 0, 0);
var topMiddle = new THREE.Vector3(0, 0, 30);
var topEnd = new THREE.Vector3(0,-10, 60);

var bottomStart = new THREE.Vector3(0, 0, 0);
var bottomMiddle = new THREE.Vector3(0, 0, -30);
var bottomEnd = new THREE.Vector3(0,-10, -60);

var topCurveQuad = new THREE.QuadraticBezierCurve3(topStart, topMiddle, topEnd);
var bottomCurveQuad = new THREE.QuadraticBezierCurve3(bottomStart, bottomMiddle, bottomEnd);

var topLimbGeometry = new THREE.TubeGeometry(topCurveQuad, numPoints, 1.5, 20, false);
var bottomLimbGeometry = new THREE.TubeGeometry(bottomCurveQuad, numPoints, 1.5, 20, false);

var topLimb = new THREE.Mesh(topLimbGeometry, normalMaterial);
var bottomLimb = new THREE.Mesh(bottomLimbGeometry, normalMaterial);

bowGroup.add(topLimb);
bowGroup.add(bottomLimb);

// scene.add(mesh);



let bowReady = true;
let bowDrawing = false;
let bowDrawAmount = 0;
let bowDrawMax = 1000;
let bowDrawSpeed = 500;
let bowReleaseSpeed = 10000;
let bowDrawn = false;
let bowReleasing = false;
let loadStatus = false;
let justLoosed = false;

testBow.bowReady = bowReady;
testBow.bowDrawing = bowDrawing;
testBow.bowDrawAmount = bowDrawAmount;
testBow.bowDrawMax = bowDrawMax;
testBow.bowDrawSpeed = bowDrawSpeed;
testBow.bowReleaseSpeed = bowReleaseSpeed;
testBow.bowDrawn = bowDrawn;
testBow.bowReleasing = bowReleasing;
testBow.loadStatus = loadStatus;


let arrowReady = true;
let arrowDrawing = false;
let arrowDrawAmount = 0;
let arrowDrawMax = 1000;
let arrowDrawSpeed = 500;
let arrowReleaseSpeed = 8000;
let arrowDrawn = false;
let arrowReleasing = false;

let arrow = new Arrow(
    {
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
        angularVelocity: {
            x: 0,
            y: 0,
            z: 0,
        },
        angularAcceleration: {
            x: 0,
            y: 0,
            z: 0,
        },
    }
);

world.addObject( arrow );

let arrows = [];


const arrowGroup = new THREE.Group( );
arrowGroup.name = "arrowGroup";


const arrowGeometry = new THREE.CylinderGeometry( 1, 1, 100, 32 );
const arrowCylinder = new THREE.Mesh( arrowGeometry, normalMaterial );
arrowCylinder.position.y = 25;

const arrowHeadGeometry = new THREE.ConeGeometry( 1.5, 5, 32 );
const arrowHead = new THREE.Mesh( arrowHeadGeometry, normalMaterial );
arrowHead.position.y = 75;
arrowHead.rotation.y = Math.PI /2;

arrowGroup.add( arrowHead );

arrowGroup.add( arrowCylinder );

// bowGroup.add( arrowGroup );

world.meshes.push( arrowGroup );

function handleInput(frameTime ){
    // console.log(inputs)      

    if(inputs.keyDownArray[32] == false){
        if(bowReady){
            bowDrawing = false;   
            bowReleasing = true;
        }

        if(bowReleasing ){
            justLoosed = true;
            loadStatus = false;
            bowReady = false;
            bowDrawn = false;

            if(bowDrawAmount > 0){
                if(justLoosed == true){
                    arrow.looseAngle = testBow.rotation;
                }
                arrow.arrowState = "loosing";
                bowDrawAmount -= bowReleaseSpeed * frameTime;
                arrowGroup.position.y = -bowDrawAmount / 20;
                justLoosed = false;
            }
            else if(bowDrawAmount  <= 10){
                arrow.arrowState = "flying";
                // arrow.release(testBow);
                bowDrawAmount = 0;
                testBow.bowDrawAmount = bowDrawAmount;
                bowReleasing = false;
                bowReady = true;
                bowDrawn = false;
                justLoosed = false;
            }
        }
    }
    if(inputs.keyDownArray[32] ){
        if(bowReady){
            arrow.arrowState = "notched";
            if(bowDrawAmount < bowDrawMax - 1 ){
                bowDrawAmount += bowDrawSpeed * frameTime;
                testBow.bowDrawAmount = bowDrawAmount;
                bowDrawing = true;
                arrowGroup.position.y = -bowDrawAmount / 20;

            }
            else{
                bowDrawn = true;

            }

        }
    }
}

let score = 0;
let scoreText = document.getElementById("score-text");
scoreText.innerHTML = "Score: " + score;


for( let item of world.meshes ){
    scene.add( item );
}

function animate( ) {
    // console.log(arrow)

    world.update(testBow, targetParameters);

    let score = arrow.getScore();
    handleInput(world.frameTime );

    console.log(arrow.getScore());

    scoreText.innerHTML = "Score: " + score;

    // console.log("Ready:", bowReady, "Drawn:", bowDrawn, "Drawing:", bowDrawing, "Draw Amount:", bowDrawAmount, "Releasing:", bowReleasing)

    let bowDrawAmountPercent = bowDrawAmount / bowDrawMax;
    let bowDrawAmountPercentInverse = 1 - bowDrawAmountPercent;

    let topStartAnimation  = new THREE.Vector3(0, 0, 0);
    let topMiddleAnimation = new THREE.Vector3(0, 0, 30);
    let topEndAnimation    = new THREE.Vector3(0, -20 -20 * bowDrawAmountPercent, 60 + 5 * (bowDrawAmountPercentInverse) );

    let bottomStartAnimation  = new THREE.Vector3(0, 0, 0);
    let bottomMiddleAnimation = new THREE.Vector3(0, 0, -30);
    let bottomEndAnimation    = new THREE.Vector3(0, -20 -20 * bowDrawAmountPercent, -60 - 5 * (bowDrawAmountPercentInverse) );

    let topCurveQuadAnimation = new THREE.QuadraticBezierCurve3(topStartAnimation, topMiddleAnimation, topEndAnimation);
    let bottomCurveQuadAnimation = new THREE.QuadraticBezierCurve3(bottomStartAnimation, bottomMiddleAnimation, bottomEndAnimation);
    
    let topLimbGeometryAnimation = new THREE.TubeGeometry(topCurveQuadAnimation, numPoints, 1.5, 20, false);
    let bottomLimbGeometryAnimation = new THREE.TubeGeometry(bottomCurveQuadAnimation, numPoints, 1.5, 20, false);

    topLimb.geometry = topLimbGeometryAnimation;
    bottomLimb.geometry = bottomLimbGeometryAnimation;

	requestAnimationFrame( animate );

    // Iterate through the objects in the world and update the meshes
    for( let i = 0; i < world.meshes.length; i++ ){

        world.meshes[i].position.x = world.objects[i].position.x;
        world.meshes[i].position.y = world.objects[i].position.y;
        world.meshes[i].position.z = world.objects[i].position.z;

        world.meshes[i].rotation.x = world.objects[i].rotation.x;
        world.meshes[i].rotation.y = world.objects[i].rotation.y;
        world.meshes[i].rotation.z = world.objects[i].rotation.z;
    }

    targetGroup.position.x = targetParameters.position.x;
    targetGroup.position.y = targetParameters.position.y;
    targetGroup.position.z = targetParameters.position.z;



    controls.update( );

	renderer.render( scene, camera );
}

animate();