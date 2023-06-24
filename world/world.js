
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
        this.updateRotation(frameTime);
        this.updateAngularVelocity(frameTime);

        this.updateMesh();
    }
}



export {World, Topography, MovingObject, Ball };
