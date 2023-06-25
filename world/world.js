
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

        this.restitution = 0.1;

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
        this.angularVelocity.x += (this.angularAcceleration.x) * frameTime ;
        this.angularVelocity.y += (this.angularAcceleration.y) * frameTime ;
        this.angularVelocity.z += (this.angularAcceleration.z) * frameTime ;

        // this.angularAcceleration.x *= this.restitution;
        // this.angularAcceleration.y *= this.restitution;
        // this.angularAcceleration.z *= this.restitution;
    }   
    updateAcceleration(frameTime){
        this.acceleration.x = 0 ;
        this.acceleration.y = 0;
        // this.acceleration.y = -GRAVITY * frameTime; 
        
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

class Weight{
    constructor(params){
        this.position = params.position;
        this.rotation = params.rotation;
        this.mass = params.mass;
    }
}

class Float{
    constructor(params){
        this.position = params.position;
        this.rotation = params.rotation;
        this.volume = params.volume;
        this.density = params.density;
        this.buoyancyForce = params.buoyancyForce;
    }
}

const wireframeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
const meshNormalMaterial = new THREE.MeshNormalMaterial();
const meshPhongMaterialRed = new THREE.MeshPhongMaterial({color: 0x880000, emissive: 0x880000, side: THREE.DoubleSide, flatShading: true});
const meshPhongMaterialGreen = new THREE.MeshPhongMaterial({color: 0x008800, emissive: 0x008800, side: THREE.DoubleSide, flatShading: true});

class ForceSphere extends MovingObject{
    constructor(params){
        super(
            {
                position: params.position,
                rotation: params.rotation,
                velocity: params.velocity,
                acceleration: params.acceleration,
                angularVelocity: params.angularVelocity,
                angularAcceleration: params.angularAcceleration,
                restitution: 0.1
            }
        );
        this.skinFriction = 10;

        this.mass = 1000
                
        this.thrusters = [
            new Thruster({
                origin: this.position,
                position: new THREE.Vector3(0, 0, -1),
                rotation: new THREE.Vector3(0, 0, 0),
                direction: new THREE.Vector3(0 ,-Math.PI/2, 0),
                force: 0
            }),

            new Thruster({
                origin: this.position,
                position: new THREE.Vector3(0, 0, 1),
                rotation: new THREE.Vector3(0, 0, 0),
                direction: new THREE.Vector3(0, Math.PI/2, 0),
                force: 0
            }),
            new Thruster({
                origin: this.position,
                position: new THREE.Vector3( 0, 0, -1 ),
                rotation: new THREE.Vector3( 0, 0, 0 ),
                direction: new THREE.Vector3( Math.PI/2 , 0, 0 ),
                force: 0
            }),

            new Thruster({
                origin: this.position,
                position: new THREE.Vector3(0 , 0 , 1 ),
                rotation: new THREE.Vector3(0 , 0 , 0 ),
                direction: new THREE.Vector3(-Math.PI/2 , 0, 0 ),
                force: 0
            }),

        ];


        this.weights = [
            new Weight({
                position: new THREE.Vector3(0, -.5, 0),
                rotation: new THREE.Vector3(0, 0, 0),
                mass: 10000
            })

        ];

        this.floats = [
            new Float({
                position: new THREE.Vector3(0, .5, 0),
                rotation: new THREE.Vector3(0, 0, 0),
                volume: 10,
                density: 1,
            })
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
            meshGroup.add(thrusterMesh);

            // const thrusterAxesHelper = new THREE.AxesHelper(1);
            // thrusterAxesHelper.position.set(thruster.position.x, thruster.position.y, thruster.position.z);
            // thrusterAxesHelper.rotation.set(thruster.direction.x, thruster.direction.y, thruster.direction.z);
            
            // meshGroup.add(thrusterAxesHelper);
        }

        for(let weight of this.weights){
            const weightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const weightMesh = new THREE.Mesh(weightGeometry, meshPhongMaterialRed);
            weightMesh.position.set(
                weight.position.x,
                weight.position.y,
                weight.position.z
            );
            weightMesh.rotation.set(
                weight.rotation.x,
                weight.rotation.y,
                weight.rotation.z
            );
            const weightAxesHelper = new THREE.AxesHelper(1);
            weightMesh.add(weightAxesHelper);
            meshGroup.add(weightMesh);
        }

        for(let float of this.floats){
            const floatGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const floatMesh = new THREE.Mesh(floatGeometry, meshPhongMaterialGreen);
            floatMesh.position.set(
                float.position.x,
                float.position.y,
                float.position.z
            );
            floatMesh.rotation.set(
                float.rotation.x,
                float.rotation.y,
                float.rotation.z
            );
            meshGroup.add(floatMesh);


            // const floatAxesHelper = new THREE.AxesHelper(1);
            // floatMesh.add(floatAxesHelper);
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

            let thrustDirection = this.rotation.add(thruster.direction);

            const torque = new THREE.Vector3().crossVectors(thruster.position, thrustDirection).multiplyScalar(thruster.force);
            totalTorque.add(torque);

            const force = thruster.direction.clone().multiplyScalar(thruster.force);
            totalForce.add(force);

            
            totalForce.add(force);
            
        }

        for(let float of this.floats){
            const positionVector = new THREE.Vector3(0,0,0)
            const gravity = new THREE.Vector3(0, -9.8, 0); // Gravity force vector
            const gravityDirection = new THREE.Vector3(0, Math.PI/2, 0); // Gravity force vector

            const angleBetween = this.rotation.applyEuler(gravityDirection);
            const leverArm = positionVector.distanceTo(float.position);
            const leverForce = leverArm * gravity.y * float.volume * float.density;
            // console.log(angleBetween);

            const torque = {
                x: Math.sin(angleBetween.x) * leverForce,
                y: 0,
                z:  Math.sin(angleBetween.z) * leverForce,
            }

            totalTorque.add(torque);

        }

        const skinFrictionTorque = this.angularVelocity.clone().multiplyScalar(this.skinFriction);

        totalTorque = {
            x: totalTorque.x - skinFrictionTorque.x,
            y: totalTorque.y - skinFrictionTorque.y,
            z: totalTorque.z - skinFrictionTorque.z,
        }

        let mainThrusterForce = 1;

        if(inputs.gamepadArray[6]){
            mainThrusterForce = inputs.gamepadArray[6];
        }
        

        const mainThrustVectors = 
        {

            x: Math.sin(this.rotation.y + Math.PI/2) * mainThrusterForce,
            y: - Math.cos(this.rotation.z + Math.PI/2) * mainThrusterForce,
            z: Math.cos(this.rotation.y + Math.PI/2) * mainThrusterForce,
        }

        


        const thrusterAxesHelper = new THREE.AxesHelper(1);
        thrusterAxesHelper.position.set(this.position.x, this.position.y, this.position.z);
        thrusterAxesHelper.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);


        // totalForce.add(mainThrust);

        this.angularAcceleration = totalTorque;
        this.acceleration = mainThrustVectors;



        if(inputs.gamepadArray[0]){
            this.thrusters[0].force = -inputs.gamepadArray[0] * 10;
            this.thrusters[1].force = -inputs.gamepadArray[0] * 10;
        }

        
        if(inputs.gamepadArray[5]){
            this.thrusters[2].force = inputs.gamepadArray[5];
            this.thrusters[3].force = inputs.gamepadArray[5];
        }

        // if(inputs.gamepadArray[6]){
        //     this.thrusters[0].force = inputs.gamepadArray[6];
        // }
    }
}



export {World, Topography, MovingObject, Ball, ForceSphere };
