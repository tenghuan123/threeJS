import React,{ useState } from 'react';
import * as THREE from "three";
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


const plane = ( width:number, height:number ) => function(u,v,target){
    const x = ( u - 0.5 ) * width;
    const y = ( v + 0.5 ) * height;
    const z = 0;
    target.set(x ,y, z);
}


const webGlAnimationCloth = () => {
    const [enableWind, setenableWind] = useState(true);
    const [showBall, setshowBall] = useState(false);
    
    const DAMPING = 0.03; // 衰减，阻尼
    const DRAG = 1 - DAMPING; // 拖放
    const MASS = 0.1; // 质量
    const restDistance = 25

    const xSegs = 10;
    const ySegs = 10;

    const clothFunction = plane( restDistance * xSegs, restDistance * ySegs );

    class Particle{
        position: THREE.Vector3;
        previous: THREE.Vector3;
        original: THREE.Vector3;
        a: THREE.Vector3;
        mass: any;
        invMass: number;
        tmp: THREE.Vector3;
        tmp2: THREE.Vector3;

        constructor( x:number, y:number, z:number, mass:number ){
            this.position = new THREE.Vector3();
            this.previous = new THREE.Vector3();
            this.original = new THREE.Vector3();
            this.a = new THREE.Vector3( 0, 0, 0 ); // acceleration
            this.mass = mass;
            this.invMass = 1 / mass;
            this.tmp = new THREE.Vector3();
            this.tmp2 = new THREE.Vector3();
            this.init( x, y, z )
        }

        // init
        init( x:number, y:number, z:number ) {
            clothFunction( x, y, this.position ); // position
            clothFunction( x, y, this.previous ); // previous
            clothFunction( x, y, this.original );
        }

        // Force -> Acceleration 力 -> 加速度
        addForce( force:THREE.Vector3 ) {
            this.a.add(
                this.tmp2.copy( force ).multiplyScalar( this.invMass )
            )
        }

        // Performs Verlet integration 执行Verlet集成
        integrate( timesq:number ) {
            const newPos = this.tmp.subVectors( this.position, this.previous );
            newPos.multiplyScalar( DRAG ).add( this.position );
            newPos.add( this.a.multiplyScalar( timesq ) );

            this.tmp = this.previous;
            this.previous = this.position;
            this.position = newPos;

            this.a.set( 0, 0, 0);
        }
    }

    class Cloth {
        w: number;
        h: number;
        particles: Particle[] | undefined;
        constraints: (number | Particle)[][] | undefined;
        constructor(w:number,h:number){
            this.w = w || 10;
            this.h = h || 10;
            this.index = this.index
            this.initParticlesAndConstraints();
        }
        initParticlesAndConstraints() {
            const { w, h } = this;
            const particles = [];
            const constraints = [];
            
            // Create particles
            for ( let v = 0; v <= h; v ++ ) {
                for ( let u = 0; u <= w; u ++ ) {
                    particles.push(
                        new Particle( u / w, v / h, 0, MASS )
                    );
                }
            }

            // Structural
            for ( let v = 0; v < h; v ++ ) {
                for ( let u = 0; u < w; u ++ ) {
                    constraints.push( [
                        particles[ this.index( u, v ) ],
                        particles[ this.index( u, v + 1 ) ],
                        restDistance
                    ] );
                    constraints.push( [
                        particles[ this.index( u, v ) ],
                        particles[ this.index( u + 1, v ) ],
                        restDistance
                    ] );
                }
            }

            for ( let u = w, v = 0; v < h; v ++ ) {
                constraints.push( [
                    particles[ this.index( u, v ) ],
                    particles[ this.index( u, v + 1 ) ],
                    restDistance
                ] );
            }

            for ( let v = h, u = 0; u < w; u ++ ) {
                constraints.push( [
                    particles[ this.index( u, v ) ],
                    particles[ this.index( u + 1, v ) ],
                    restDistance
                ] );
            }
            this.particles = particles;
			this.constraints = constraints;
        }

        index(u:number ,v:number) {
            return u + v * ( this.w + 1 );
        }
    }

    const cloth = new Cloth( xSegs, ySegs );

    const GRABITY = 981 * 1.4;
    const gravity = new THREE.Vector3( 0, - GRABITY, 0).multiplyScalar( MASS );

    const TIMESTEP = 18 / 1000;
    const TIMESTEP_SQ = TIMESTEP * TIMESTEP;

    let pins: string | any[] = [];

    let container, stats;
	let camera, scene, renderer;

	let clothGeometry: any ;
	let sphere:any;
    let object;

    const windForce = new THREE.Vector3( 0, 0, 0 )

    const ballPosition = new THREE.Vector3( 0, - 45, 0 )
    const ballSize = 60; //40

    const tmpForce = new THREE.Vector3();

    const diff = new THREE.Vector3();

    const satisfyConstraints = ( p1, p2, distance ) => {
        diff.subVectors( p2.position, p1.position );
        const currentDist = diff.length();
        if( currentDist === 0) return; // prevents division by 0
        const correction = diff.multiplyScalar( 1 - distance /currentDist );
        const correctionHalf = correction.multiplyScalar( 0.5 );
        p1.position.add( correctionHalf );
        p2.position.add( correctionHalf );
    }
            
    const simulate = ( now ) => {
        const windStrength = Math.cos( now / 7000 ) * 20 + 40;
        windForce.set( Math.sin( now / 2000), Math.cos( now / 3000), Math.sin( now / 1000) );
        windForce.normalize();
        windForce.multiplyScalar( windStrength );
        // Aerodynamics forces
        const particles = cloth.particles;

        if( enableWind ) {
            let indx ;
            const normal = new THREE.Vector3();
            const indices = clothGeometry.index;
            const normals = clothGeometry.attributes.normal;

            for( let i = 0, il = indices.count; i< il; i +=3 ) {
                for( let j = 0; j < 3; j++ ) {
                    indx = indices.getX( i + j );
                    normal.fromBufferAttribute( normals, indx );
                    tmpForce.copy( normal ).normalize().multiplyScalar( normal.dot( windForce ) );
                    particles?.[ indx ].addForce( tmpForce);
                }
            }
        }
        if(particles && particles.length > 0) {
            for( let i = 0, il = particles?.length; i < il; i++){
                const particle = particles[ i ];
                particle.integrate( TIMESTEP_SQ );
            }
        }

        // Start Constraints
        const constraints = cloth.constraints;
        const il = constraints?.length;

        if( constraints && constraints?.length > 0 && il) {
            for( let i = 0; i < il; i++ ) {
                const constraint = constraints[ i ];
                satisfyConstraints( constraint[ 0 ], constraint[ 1 ],  constraint[2] );
            }
        }
         // Ball Constraints
         ballPosition.z = -Math.sin( now / 600 ) * 90; // + 40;
         ballPosition.x = Math.cos( now / 400 ) * 70; 

         if( showBall ) {
             sphere.visible = true;
             if(particles && particles.length > 0){

                for( let i = 0, il = particles.length; i < il; i ++ ) {
                    const particle = particles[ i ];
                    const pos = particle.position;
                    diff.subVectors( pos, ballPosition );
                    if( diff.length() < ballSize ) {
                        // collided
                        diff.normalize().multiplyScalar( ballSize );
                        pos.copy( ballPosition ).add( diff );
                     }
                }

             }
         } else {
           sphere.visible = false;  
         }

         // Floor Constraints

         if( particles && particles.length > 0 ) {
            for( let i = 0, il = particles.length; i < il; i ++ ) {

                const particle = particles[ i ];
                const pos = particle.position;
                if( pos.y < - 250 ) {
                    pos.y = -250
                }

            }
            // Pin Constraints
             for( let i = 0, il = pins.length; i <il; i ++ ) {
                const xy = pins[ i ];
                const p = particles[ xy ];
                p.position.copy( p.original );
                p.previous.copy( p.original );
            }
         }

    }



    return <div>Simple Cloth Simulation<br/>
    Verlet integration with relaxed constraints<br/></div>
}
export default webGlAnimationCloth