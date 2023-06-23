
import { inputs } from 'inputs';

// Constants
const GRAVITY = 981; // m/s^2
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
    update(testBow, targetParameters){
        this.frameCount++;
        this.time = this.clock.getElapsedTime();
        this.frameTime = this.time - this.lastFrameTime; 
        this.lastFrameTime = this.time;
        for(let i = 0; i < this.objects.length; i++){
            if( this.frameTime){
                this.objects[i].update(this.frameTime, testBow, targetParameters);
            }
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
        this.acceleration.z = -GRAVITY;
        
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
    }

    update(frameTime){
        this.updatePosition(frameTime);
        this.updateVelocity(frameTime);
        this.updateAcceleration(frameTime);
        this.updateRotation(frameTime);
        this.updateAngularVelocity(frameTime);
    }
}

class Target extends Topography{
    constructor(params){
        super(
            {
                position: params.position,
                rotation: params.rotation,
            }
        );
    }

}

class Bow extends Topography{
    constructor(params){
        super(
            {
                position: params.position,
                rotation: params.rotation,
            }
        );
    }

    update(frameTime){
        // this.updatePosition({x: 10, y: 0, z: 0});
        this.updateRotation(
            {
                x: 0,
                y: inputs.mouseY / window.innerHeight * Math.PI/2 - Math.PI/4,
                z: inputs.mouseX / window.innerWidth * 2 * Math.PI / 2,
            }
        );
    }
}

class Arrow extends MovingObject{
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
        this.arrowState = 'notched';
        this.torque = {
            x: 0,
            y: 0,
            z: 0
        }
        this.liftCoefficientFront = 0.15;
        this.dragCoefficientFront = 0.47;
        this.liftCoefficientBack= 0.15;
        this.dragCoefficientBack = 0.47;
        this.length = 100;
        this.looseAngle = {};
        this.score = 0;
        this.lastScore = 0;
    }
    update(frameTime, bow, targetParameters){
        if(this.arrowState == 'stationary'){
            this.position.x = bow.position.x + Math.cos(bow.rotation.y) * Math.cos(bow.rotation.z - Math.PI/2) * this.length / 2;
            this.position.y = bow.position.y + Math.sin(bow.rotation.z - Math.PI/2) * this.length /2;
            this.position.z = bow.position.z ;

        }
        else if(this.arrowState == 'notched'){
            this.rotation.x = bow.rotation.x;
            this.rotation.y = bow.rotation.y;
            this.rotation.z = bow.rotation.z;
            this.position.x = bow.position.x + Math.cos(bow.rotation.y) * Math.cos(bow.rotation.z - Math.PI/2) * this.length / 2 + bow.bowDrawAmount/50;
            this.position.y = bow.position.y + Math.sin(bow.rotation.z - Math.PI/2) * this.length /2;
            this.position.z = bow.position.z ;
        }
        else if(this.arrowState == 'loosing'){
            let bowPower = bow.bowDrawAmount * 6;
            this.velocity.x = - bowPower * Math.cos(this.looseAngle.y) * Math.cos(this.looseAngle.z - Math.PI/2);
            this.velocity.y = - bowPower * Math.sin(this.looseAngle.z - Math.PI/2);
            this.velocity.z = bowPower * Math.sin(this.looseAngle.y) * Math.cos(this.looseAngle.z - Math.PI/2);
            this.updatePosition(frameTime);
        }

        else if(this.arrowState  == 'flying'){


            let distanceToTarget = {
                x: targetParameters.position.x - this.position.x - this.velocity.x * frameTime - this.length /2 ,
                y: targetParameters.position.y - this.position.y - this.velocity.y * frameTime - this.length /2 ,
                z: targetParameters.position.z - this.position.z - this.velocity.z * frameTime - this.length /2 ,
            }
    
            let distanceToTargetMagnitude = Math.sqrt(distanceToTarget.x ** 2 + distanceToTarget.y ** 2);
            
            if(distanceToTargetMagnitude < 100){
                this.arrowState = 'stationary';
                this.score += 1;
            }else{
                this.updatePosition(frameTime);
                this.updateVelocity(frameTime);
                this.updateAcceleration(frameTime);
                this.updateRotation(frameTime);
                this.updateAngularVelocity(frameTime);
            }
            
            // this.angleOfAttack = Math.atan(this.velocity.y / this.velocity.x);
            // // console.log(this.angleOfAttack)

            // this.lift = 0.5 * AIR_DENSITY * this.velocity.x * this.velocity.x * this.area * this.liftCoefficient * Math.sin(this.angleOfAttack);
            // this.drag = 0.5 * AIR_DENSITY * this.velocity.x * this.velocity.x * this.area * this.dragCoefficient * Math.cos(this.angleOfAttack);

        }

        // if(this.position.z < -100 || this.position.x <= -1100){
        //     this.arrowState = 'stationary';

        //     this.velocity.x = 0;
        //     this.velocity.y = 0;
        //     this.velocity.z = 0;

        //     this.position.x = -1000 + this.length;


        // }
    }
    getScore(){
        return this.score;
    }

}

export {World, Topography, MovingObject, Ball, Bow, Arrow};
