import React,{ useState } from 'react';
import * as THREE from "three";
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import circuit from '../../asset/patterns/circuit_pattern.png';
import grasslight from '../../asset/terrain/grasslight-big.jpg'


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
            // console.log(this)
        }

        // Performs Verlet integration 执行Verlet集成
        integrate( timesq:number ) {
            const newPos = this.tmp.subVectors( this.position, this.previous );
            newPos.multiplyScalar( DRAG ).add( this.position );
            newPos.add( this.a.multiplyScalar( timesq ) );
            this.tmp = this.previous;
            this.previous = this.position;
            this.position = newPos;
            // console.log(this)
            this.a.set( 0, 0, 0);
        }
    }

    class Cloth {
        w: number;
        h: number;
        particles: Particle[] | undefined;
        constraints: (number | Particle)[][] | undefined;
        index: ((u: number, v: number) => number) | undefined;
        constructor(w:number,h:number){
            this.w = w || 10;
            this.h = h || 10;
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
                        particles[ index( u, v ) ],
                        particles[ index( u, v + 1 ) ],
                        restDistance
                    ] );

                    constraints.push( [
                        particles[ index( u, v ) ],
                        particles[ index( u + 1, v ) ],
                        restDistance
                    ] );

                }

            }

            for ( let u = w, v = 0; v < h; v ++ ) {

                constraints.push( [
                    particles[ index( u, v ) ],
                    particles[ index( u, v + 1 ) ],
                    restDistance

                ] );

            }

            for ( let v = h, u = 0; u < w; u ++ ) {

                constraints.push( [
                    particles[ index( u, v ) ],
                    particles[ index( u + 1, v ) ],
                    restDistance
                ] );

            }


            this.particles = particles;
            this.constraints = constraints;
            function index( u:number, v:number ){
                return u + v * ( w + 1);
            }
            this.index = index;
        }

    }

    const cloth = new Cloth( xSegs, ySegs );

    const GRABITY = 981 * 1.4;
    const gravity = new THREE.Vector3( 0, - GRABITY, 0).multiplyScalar( MASS );
    const TIMESTEP = 18 / 1000;
    const TIMESTEP_SQ = TIMESTEP * TIMESTEP;

    let pins: string | any[] = [];

    let container, stats:any;
	let camera: any,  scene: THREE.Scene, renderer: any;

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
        p2.position.sub( correctionHalf );
    }
            
    const simulate = ( now ) => {
        const windStrength = Math.cos( now / 7000 ) * 20 + 40;
        windForce.set( Math.sin( now / 2000), Math.cos( now / 3000), Math.sin( now / 1000) );
        windForce.normalize();
        windForce.multiplyScalar( windStrength );
        // Aerodynamics forces 气动力
        const particles = cloth.particles;
        if(particles && particles.length > 0) {
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
                    particles[ indx ].addForce( tmpForce);
                }
            }
        }
            for( let i = 0, il = particles.length; i < il; i++){
                const particle = particles[ i ];
                // console.log(particle);
                // console.log(gravity)
                particle.addForce( gravity );
                // console.log(TIMESTEP_SQ);
                particle.integrate( TIMESTEP_SQ );
            }
        }

        // Start Constraints
        const constraints = cloth.constraints;

        if( constraints && constraints.length > 0) {
            const il = constraints.length;
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

    /* testing cloth simulation  */

    const pinsFormation: (string | any[])[] = [];
    pins = [ 6 ];

    pinsFormation.push( pins );
    
    pins = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    pinsFormation.push( pins );

    pins = [ 0 ];
    pinsFormation.push( pins );

    pins = []; //cut the rope ;)
    pinsFormation.push( pins );

    pins = [ 0, cloth.w ]; // classic 2 pins
    pinsFormation.push( pins );

    pins = pinsFormation[ 1 ];

    const togglePins = () => {
        pins = pinsFormation[ ~ ~ ( Math.random() * pinsFormation.length ) ];
    }

    const init = () => {
        container = document.createElement( 'div' );
        document.body.appendChild( container );

        // scene

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xcce0ff );
        scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

        // camera
        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set( 1000, 50, 1500 );

        // lights
        scene.add( new THREE.AmbientLight( 0x666666 ) );

        const light = new THREE.DirectionalLight( 0xdfebff, 1 );
        light.position.set( 50, 200, 200 );
        light.position.multiplyScalar( 1.3 );

        light.castShadow = true;

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        const d = 300;

        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.camera.far = 1000;

        scene.add( light );

        // cloth material
        const loader = new THREE.TextureLoader();
        const clothTexture = loader.load( circuit );
        clothTexture.anisotropy = 16;

        const clothMaterial = new THREE.MeshLambertMaterial( { 
            map: clothTexture,
            side: THREE.DoubleSide,
            alphaTest: 0.5
        } );

        // cloth geometry
        clothGeometry = new THREE.ParametricBufferGeometry( clothFunction, cloth.w, cloth.h );

        // cloth mesh
        object = new THREE.Mesh( clothGeometry, clothMaterial );
        object.position.set( 0, 0, 0);
        object.castShadow = true;
        scene.add( object );

        object.customDepthMaterial = new THREE.MeshDepthMaterial( {
            depthPacking: THREE.RGBADepthPacking,
            map: clothTexture,
            alphaTest: 0.5
        } )

        // sphere

        const ballGeo = new THREE.SphereBufferGeometry( ballSize, 32, 16 );
        const ballMaterial = new THREE.MeshLambertMaterial();

        sphere = new THREE.Mesh( ballGeo, ballMaterial );
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.visible = false;
        scene.add( sphere );

        // ground
        const groundTexture = loader.load( grasslight );
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set( 25, 25 );
        groundTexture.anisotropy = 16;
        groundTexture.encoding = THREE.sRGBEncoding;

        const groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

        let mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );
        mesh.position.y = -250;
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );

        // poles
        const poleGeo = new THREE.BoxBufferGeometry( 5, 375, 5 );
        const poleMat = new THREE.MeshLambertMaterial();

        mesh = new THREE.Mesh( poleGeo, poleMat );
        mesh.position.x = -125;
        mesh.position.y = - 62;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );

        mesh = new THREE.Mesh( poleGeo, poleMat );
        mesh.position.x = 125;
        mesh.position.y = -62;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );   

        mesh = new THREE.Mesh( poleGeo, poleMat );
        mesh.position.x = 125;
        mesh.position.y = - 62;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );

        mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 255, 5, 5 ), poleMat );
        mesh.position.y = -250 + ( 750 / 2 );
        mesh.position.x = 0;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );

        const gg = new THREE.BoxBufferGeometry( 10, 10, 10 );
        mesh = new THREE.Mesh( gg, poleMat );
        mesh.position.y = -250;
        mesh.position.x = 125;
        mesh.receiveShadow = true;
        scene.add( mesh );

        mesh = new THREE.Mesh( gg, poleMat );
        mesh.position.y = - 250;
        mesh.position.x = -125;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } )
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        container.appendChild( renderer.domElement );
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;

        // controls
        const controls = new OrbitControls( camera, renderer.domElement );
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 1000;
        controls.maxDistance = 5000;

        // performance monitor
        stats = new Stats();
        container.appendChild( stats.dom );

        window.addEventListener( 'resize', onWindowResize, false );
        const gui = new GUI();
        const params = {
            enableWind,
            showBall,
            togglePins
        }
        gui.add( params, 'enableWind' ).name( 'Enable wind' );
        gui.add( params, 'showBall' ).name( 'Show ball' );
        gui.add( params, 'togglePins' ).name( 'Toggle pins' );

        //
        if( typeof TESTING !== 'undefined') {
            for( let i = 0; i < 50; i++ ) {
                simulate( 500 - 10 * i );
            }
        }
    }
    //
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setsize( window.innerWidth, window.innerHeight );
    }
    //
    const animateRender = () => {
        const p = cloth.particles;
        if(p&&p.length>0){
            for( let i = 0 , il = p.length; i < il; i++ ) {
                const v = p[ i ].position;
                // console.log(v);
                clothGeometry.attributes.position.setXYZ( i, v.x, v.y, v.z );
            }
            clothGeometry.attributes.position.needsUpdate = true;
            clothGeometry.computeVerTexNormals?.();
            sphere.position.copy( ballPosition );
            renderer.render( scene, camera );
        }
    }
    //
    const animate = ( now ) => {
        requestAnimationFrame( animate );
        simulate( now );
        animateRender();
        stats.update()
    }

    init();
	animate( 0 );

    return <div>Simple Cloth Simulation<br/>
    Verlet integration with relaxed constraints<br/></div>
}
export default webGlAnimationCloth