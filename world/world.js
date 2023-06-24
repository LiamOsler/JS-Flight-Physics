
import { inputs } from 'inputs';
import * as THREE from 'three';


// Constants
const GRAVITY = 9.81; // m/s^2
const AIR_DENSITY = 1.225; // kg/m^3
const AIR_VISCOSITY = 1.7894e-5; // kg/(m*s)


class World {
    constructor(clock){
        this.objects = [];
        this.time = 0;
        this.frameTime = 0;
        this.frameCount = 0;
        this.frameRate = 0;
        this.frameRateInterval = 1000;
        this.lastFrameRateTime = 0;
        this.frameRateCount = 0;
        this.clock = clock;
    }
    addObject(object){
        this.objects.push(object);
    }
    update(){
        this.frameCount++;
        this.time = this.clock.getElapsedTime();
        this.frameTime = this.time - this.lastFrameTime;
        this.lastFrameTime = this.time;

        for(let i = 0; i < this.objects.length; i++){
            let frameTime = this.frameTime;
            if(!frameTime){
                frameTime = 0;
            }
            this.objects[i].update(frameTime, this.time);
        }
    }
}

class Topography{
    constructor(params){
        this.position = params.position;
        this.rotation = params.rotation;
    }
    updatePosition(position){
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }
    updateRotation(rotation){
        this.rotation.x = rotation.x;
        this.rotation.y = rotation.y;
        this.rotation.z = rotation.z;
    }
}

class MovingObject extends Topography{
    constructor(params){
        super(
            {                
                position: params.position,
                rotation: params.rotation
            }
        );

        this.velocity = params.velocity;
        this.acceleration = params.acceleration;

        this.angularVelocity = params.angularVelocity;
        this.angularAcceleration = params.angularAcceleration;
    }
    updatePosition(frameTime){
        this.position.x += this.velocity.x * frameTime;
        this.position.y += this.velocity.y * frameTime;
        this.position.z += this.velocity.z * frameTime;
    }
    updateVelocity(frameTime){
        this.velocity.x += this.acceleration.x * frameTime;
        this.velocity.y += this.acceleration.y * frameTime;
        this.velocity.z += this.acceleration.z * frameTime;
    }
    updateRotation(frameTime){
        this.rotation.x += this.angularVelocity.x * frameTime;
        this.rotation.y += this.angularVelocity.y * frameTime;
        this.rotation.z += this.angularVelocity.z * frameTime;
    }
    updateAngularVelocity(frameTime){
        this.angularVelocity.x += this.angularAcceleration.x * frameTime;
        this.angularVelocity.y += this.angularAcceleration.y * frameTime;
        this.angularVelocity.z += this.angularAcceleration.z * frameTime;
    }
    updateAcceleration(){
        // this.acceleration.x = 0;
        // this.acceleration.y = 0;
        // this.acceleration.y = -GRAVITY;
        
    }
}

class Ball extends MovingObject{
    constructor(params){
        super(
            {
                position: params.position,
                rotation: params.rotation,
                velocity: params.velocity,
                acceleration: params.acceleration,
                angularVelocity: params.angularVelocity,
                angularAcceleration: params.angularAcceleration
            }
        );
        this.mesh = params.mesh;
        
    }
    addToScene(scene){
        scene.add(this.mesh);
    }
    
    updateMesh(){
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;

        this.mesh.rotation.x = this.rotation.x;
        this.mesh.rotation.y = this.rotation.y;
        this.mesh.rotation.z = this.rotation.z;
    }

    update(frameTime){

        this.updatePosition(frameTime);
        this.updateVelocity(frameTime);
        this.updateAcceleration(frameTime);
        // this.updateRotation(frameTime);
        // this.updateAngularVelocity(frameTime);

        this.updateMesh();
    }
}

class SpaceShip extends MovingObject{
    constructor(params){
        super(
            {
                position: params.position,
                rotation: params.rotation,
                velocity: params.velocity,
                acceleration: params.acceleration,
                angularVelocity: params.angularVelocity,
                angularAcceleration: params.angularAcceleration
            }
        );
        this.hull = {
            hull1: {
                type: 'cylinder',
                position: new THREE.Vector3(0,0,0),
                rotation: new THREE.Vector3(0,0,0),
                length: 2,
                radius: 1,
                mass: 1,
            },
            hull2: {
                type: 'cylinder',
                position: new THREE.Vector3(0,2,0),
                rotation: new THREE.Vector3(0,0,0),
                length: 2,
                radius: .6,
                mass: 1,
            },
            hull3: {
                type: 'cylinder',
                position: new THREE.Vector3(0,4,0),
                rotation: new THREE.Vector3(0,0,0),
                length: 2,
                radius: .3,
                mass: 1,
            },
        }
        this.thrusters = {
            primary:{
                type: 'cone',
                position: new THREE.Vector3(0,-2,0),
                direction: new THREE.Vector3(0,0,0),
                length: 2,
                radius: 1,
                mass: 1,
                thrust: .1
                }
            }
        }

    createMesh(){
        let shipGroup = new THREE.Group();
        for(let key in this.hull){
            console.log(key);
            if(this.hull[key].type == 'cylinder'){
                    const cylinderGeometry = new THREE.CylinderGeometry(this.hull[key].radius, this.hull[key].radius, this.hull[key].length, 32);
                    const cylinderMaterial = new THREE.MeshNormalMaterial();
                    const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                    cylinderMesh.position.x = this.hull[key].position.x;
                    cylinderMesh.position.y = this.hull[key].position.y;
                    cylinderMesh.position.z = this.hull[key].position.z;
                    shipGroup.add(cylinderMesh);
            }
        }
        for(let key in this.thrusters){
            console.log(key);
            if(this.thrusters[key].type == 'cone'){
                const coneGeometry = new THREE.ConeGeometry(this.thrusters[key].radius, this.thrusters[key].length, 32);
                const coneMaterial = new THREE.MeshNormalMaterial();
                const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
                coneMesh.position.x = this.thrusters[key].position.x;
                coneMesh.position.y = this.thrusters[key].position.y;
                coneMesh.position.z = this.thrusters[key].position.z;

                const thrusterGroup = new THREE.Group();
                thrusterGroup.add(coneMesh);

                shipGroup.add(thrusterGroup);

                this.thrusterMesh = thrusterGroup;
            }
        }

        this.mesh = shipGroup;

        // let mainHullGeometry = new THREE.CylinderGeometry(1,1,2,32);

        // let geometry = new THREE.BoxGeometry(1,1,1);
        // let material = new THREE.MeshNormalMaterial();
        // this.mesh = new THREE.Mesh(mainHullGeometry, material);
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    updateMesh(){
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;

        this.mesh.rotation.x = this.rotation.x;
        this.mesh.rotation.y = this.rotation.y;
        this.mesh.rotation.z = this.rotation.z;

        this.thrusterMesh.rotation.x = this.thrusters.primary.direction.x;
        this.thrusterMesh.rotation.z = this.thrusters.primary.direction.z;


    }

    update(frameTime){

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        this.thrusters.primary.direction.x = (- inputs.mouseX/windowWidth * Math.PI * 2 + Math.PI) / 4
        this.thrusters.primary.direction.z = -(-inputs.mouseY/windowHeight * Math.PI * 2 + Math.PI) / 4


        if(inputs.keyDownArray[87]){
            console.log('w')
            this.thrusters.primary.thrust = 1;
        }

        this.angularAcceleration.x = -this.thrusters.primary.direction.x * this.thrusters.primary.thrust / this.hull.hull1.mass;
        this.angularAcceleration.z = -this.thrusters.primary.direction.z * this.thrusters.primary.thrust / this.hull.hull1.mass;
        this.angularAcceleration.y = -this.thrusters.primary.direction.y * this.thrusters.primary.thrust / this.hull.hull1.mass;


        this.acceleration.x = Math.sin(this.rotation.y) * this.thrusters.primary.thrust / this.hull.hull1.mass;
        this.acceleration.y = Math.cos(this.rotation.y) * this.thrusters.primary.thrust / this.hull.hull1.mass;
        this.acceleration.z = Math.sin(this.rotation.x) * this.thrusters.primary.thrust / this.hull.hull1.mass;


        this.updatePosition(frameTime);
        this.updateVelocity(frameTime);
        // this.updateAcceleration(frameTime);
        this.updateRotation(frameTime);
        this.updateAngularVelocity(frameTime);

        this.updateMesh();
    }
}



export {World, Topography, MovingObject, Ball, SpaceShip };
