
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

class Thruster{
    constructor(params){
        this.position = params.position;
        this.rotation = params.rotation;
        this.force = params.force;
        this.direction = params.direction;
        this.origin = params.origin;
        this.radius = params.position.distanceTo(params.origin);
    }
}

const wireframeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
const meshNormalMaterial = new THREE.MeshNormalMaterial();

class ForceSphere extends MovingObject{
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
        
        
        this.thrusters = [
            new Thruster({
                origin: this.position,
                position: new THREE.Vector3(1, 0, 0), 
                rotation: new THREE.Vector3(0, 0, 0),
                direction: new THREE.Vector3(1, 0, 1),
                force: .1
            }),
            new Thruster({
                origin: this.position,
                position: new THREE.Vector3(-1, 0, 0), 
                rotation: new THREE.Vector3(0, 0, 0),
                direction: new THREE.Vector3(-1, 0, -1),
                force: .1
            }),
            // new Thruster({
            //     origin: this.position,
            //     position: new THREE.Vector3(-1, 0, 0), 
            //     rotation: new THREE.Vector3(0, 0, 0),
            //     direction: new THREE.Vector3(1, 0, 0),
            //     force: 0
            // }),

            new Thruster({
                origin: this.position,
                position: new THREE.Vector3(0, -1, 0), 
                rotation: new THREE.Vector3(0, 0, 0),
                direction: new THREE.Vector3(0, 1, 0),
                force: .1
            }),
        ];

        this.generateMesh();


    }
    generateMesh(){
        const meshGroup = new THREE.Group();

        const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshBasicMaterial({color: 0xffff00});
        const meshSphere = new THREE.Mesh(sphereGeometry, wireframeMaterial);
        const sphereAxesHelper = new THREE.AxesHelper(1);
        meshSphere.add(sphereAxesHelper);

        meshGroup.add(meshSphere);

        for(let thruster of this.thrusters){
            const thrusterGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const thrusterMesh = new THREE.Mesh(thrusterGeometry, meshNormalMaterial);
            thrusterMesh.position.set(
                thruster.position.x,
                thruster.position.y,
                thruster.position.z
            );
            thrusterMesh.rotation.set(
                thruster.rotation.x,
                thruster.rotation.y,
                thruster.rotation.z
            );
            const thrusterAxesHelper = new THREE.AxesHelper(1);
            thrusterAxesHelper.rotation.set(
                thruster.direction.x,
                thruster.direction.y,
                thruster.direction.z
            )
            thrusterMesh.add(thrusterAxesHelper);
            
            meshGroup.add(thrusterMesh);
        }
        this.mesh = meshGroup;
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
        this.updateMesh();
        this.updatePosition(frameTime);
        this.updateRotation(frameTime);
        this.updateVelocity(frameTime);
        this.updateAcceleration(frameTime);
        this.updateAngularVelocity(frameTime);


        let totalTorque = new THREE.Vector3();
        let totalForce = new THREE.Vector3();

        for(let thruster of this.thrusters){
            const force = thruster.direction.clone().applyEuler(thruster.rotation).multiplyScalar(thruster.force);
            const leverArm = thruster.position.clone().sub(this.position);
            const torque = leverArm.clone().cross(force);

            totalTorque.add(torque);
            totalForce.add(force);
        }


        this.angularAcceleration = totalTorque;
        this.acceleration = totalForce;


    }
}



export {World, Topography, MovingObject, Ball, ForceSphere };
