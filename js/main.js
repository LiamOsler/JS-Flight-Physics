import { inputs } from 'inputs';

import { World,  Planet, Orbital} from 'world';

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
camera.position.set( 10, 10, 10 );


const controls = new OrbitControls( camera, renderer.domElement );


controls.update();


let sphereGeometry = new THREE.SphereGeometry( 15, 32, 32 );
let meshNormalMaterial = new THREE.MeshNormalMaterial( );


// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry( 10000, 10000, 100, 100 ), meshNormalMaterial);
//     plane.rotation.x = - Math.PI / 2;
//     plane.position.z = -1
//     scene.add( plane );


function init(){
    scene.remove.apply(scene, scene.children);
    const axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );


    const grid = new THREE.GridHelper( 10, 10 );

    scene.add( grid );

    const light = new THREE.DirectionalLight( 0xffffff, .1 );
    light.position.set( 100, 100, 100 );
    scene.add( light );


    const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( ambientLight );

    world = new World( clock );
    world.objects = [];

    let planet = new Planet({
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Vector3(0, 0, 0),
        radius: 100,
        mass: 10000,
        orbitalRadius: 1000,
        orbitalPeriod: 1000,
        orbitalRotation: 0,
    });

    world.addObject(planet);
    world.planets.push(planet);

    let planet2 = new Planet({
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Vector3(0, 0, 0),
        radius: 500,
        mass: 10000000,
        orbitalRadius: 2000,
        orbitalPeriod: 500,
        orbitalRotation: 10,
    });

    world.addObject(planet2);
    world.planets.push(planet2);


    // let planet2 = new Planet({
    //     position: new THREE.Vector3(0, 0, 0),
    //     rotation: new THREE.Vector3(0, 0, 0),
    //     radius: 100,
    //     mass: 10000,
    //     orbitalRadius: 1200,
    //     orbitalPeriod: 10
    // });

    
    // world.addObject(planet2);
    // world.planets.push(planet2);




    //Generate a 3D grid of moving spheres
    for(let i = -15; i < 15; i++){
        for(let j = -15; j < 15; j++){
            for(let k = -15; k < 15; k++){
                    let sphere = new THREE.Mesh(sphereGeometry, meshNormalMaterial);
                    let orbital = new Orbital({
                        position: new THREE.Vector3(i * 100 + Math.random() * 50, j * 100 + Math.random() * 50, k * 100 + Math.random() * 50),
                        rotation: new THREE.Vector3(0, 0, 0),
                        velocity: new THREE.Vector3((Math.random()-.5)*10, (Math.random()-.5)*10,(Math.random()-.5)*10),
                        acceleration: new THREE.Vector3(0, 0, 0),
                        angularVelocity: new THREE.Vector3(0, 0, 0),
                        angularAcceleration: new THREE.Vector3(0, 0, 0),
                        mass: 100,
                        radius: 1,
                        restitution: 0.8,
                        friction: 0.1,
                        mesh: sphere
                    });
                    orbital.updateMesh();
                    world.addObject(orbital);
                    world.orbitals.push(orbital);
            }
        }   
    }


    for(let i = 0; i < world.objects.length; i++){
        world.objects[i].addToScene(scene);
    }
}

init();

document.getElementById('start-button').addEventListener('click', function(){
    init();
});



function animate( ) {
    // console.log(arrow)


    world.update();


	requestAnimationFrame( animate );


    controls.update( );

	renderer.render( scene, camera );
}

animate();