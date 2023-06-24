import { inputs } from 'inputs';

import { World, Ball} from 'world';

import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

const clock = new THREE.Clock();
clock.start();

let world = new World( clock );

const threeArea = document.getElementById('three-area');
const guiArea = document.getElementById('gui-area');

const renderer = new THREE.WebGLRenderer( );
renderer.setSize( window.innerWidth, window.innerHeight );
threeArea.appendChild( renderer.domElement );

const scene = new THREE.Scene( );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.set( -10, 10, 10 );
controls.update();


const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );


const grid = new THREE.GridHelper( 10, 10 );

scene.add( grid );

const light = new THREE.DirectionalLight( 0xffffff, .1 );
light.position.set( 100, 100, 100 );
scene.add( light );


const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );



// const plane = new THREE.Mesh(
// new THREE.PlaneGeometry( 10000, 10000, 100, 100 ), normalMaterial);
// plane.rotation.x = - Math.PI / 2;
// plane.position.z = -1
// scene.add( plane );

let sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
let meshNormalMaterial = new THREE.MeshNormalMaterial( );


for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
        for(let k = 0; k < 10; k++){
                let sphere = new THREE.Mesh(sphereGeometry, meshNormalMaterial);

                let ball = new Ball({
                    position: new THREE.Vector3(i * 100 + Math.random() * 50, j * 100 + Math.random() * 50, k * 100 + Math.random() * 50),
                    rotation: new THREE.Vector3(0, 0, 0),
                    velocity: new THREE.Vector3((Math.random()-.5)*2, (Math.random()-.5)*2,(Math.random()-.5)*2),
                    acceleration: new THREE.Vector3(0, 0, 0),
                    angularVelocity: new THREE.Vector3(0, 0, 0),
                    angularAcceleration: new THREE.Vector3(0, 0, 0),
                    mass: 1,
                    radius: 1,
                    restitution: 0.8,
                    friction: 0.1,
                    mesh: sphere
                });
                ball.updateMesh();
                world.addObject(ball);
        }
    }
    
}

// let ball = new Ball({
//     position: sphere.position,
//     rotation: sphere.rotation,
//     velocity: new THREE.Vector3(0, 0, 0),
//     acceleration: new THREE.Vector3(0, 0, 0),
//     angularVelocity: new THREE.Vector3(0, 0, 0),
//     angularAcceleration: new THREE.Vector3(0, 0, 0),
//     mass: 1,
//     radius: 1,
//     restitution: 0.8,
//     friction: 0.1,
//     mesh: sphere
// });








function init(){
    for(let i = 0; i < world.objects.length; i++){
        world.objects[i].addToScene(scene);
    }
}

init();


function animate( ) {
    // console.log(arrow)

    world.update();


	requestAnimationFrame( animate );


    controls.update( );

	renderer.render( scene, camera );
}

animate();