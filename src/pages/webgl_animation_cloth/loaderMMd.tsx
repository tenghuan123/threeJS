import React from 'react'
import {MMDLoader} from 'three/examples/jsm/loaders/MMDLoader'
import {OutlineEffect} from 'three/examples/jsm/effects/OutlineEffect'
import {MMDAnimationHelper} from 'three/examples/jsm/animation/MMDAnimationHelper'

import * as THREE from 'three'
import SelfThreeBase from '../SelfThreeBase';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
const AMMO = require('../ammo')
AMMO().then(ammolib=>{
    window.Ammo = ammolib;
})

interface loaderThreeObjectProps {
    queryElement:string;
}

class loaderMMD {
    clock: THREE.Clock
    helper: MMDAnimationHelper
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    effect: OutlineEffect
    control: OrbitControls
    el: any
    constructor(props:loaderThreeObjectProps){
        this.el = document.querySelector(props.queryElement)
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100000 );
        this.clock = new THREE.Clock()
        this.helper = new MMDAnimationHelper();
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.rendererInit();
        this.effect = new OutlineEffect(this.renderer);
        // this.control = new OrbitControls(this.camera,this.renderer.domElement);
        this.loaderObj();
        this.addLight();
        this.animate();
    }
    rendererInit() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        if(this.el){
            this.el.appendChild(this.renderer.domElement)
        }else{
            document.body.appendChild(this.renderer.domElement)
        }
        
    }
    loaderObj() {
        const loader = new MMDLoader();
        const listener = new THREE.AudioListener();
        this.camera.add( listener );
        this.scene.add(this.camera);
        const audioParams = { delayTime: 160 * 1 / 30 };
        loader.loadWithAnimation(
            '/module/mmd/miku/miku_v2.pmd',
            '/module/mmd/vmds/wavefile_v2.vmd',
            mmd=>{
                const mesh = mmd.mesh;
                console.log(mmd.animation)
                this.helper.add(mesh,{
                    animation:mmd.animation,
                    physics:true
                })
                loader.loadAnimation('/module/mmd/vmds/wavefile_camera.vmd',this.camera,(mesh)=>{
                    this.helper.add(this.camera,{
                        animation:mesh
                    });
                })
                new THREE.AudioLoader().load(
                    '/module/mmd/audios/wavefile_short.mp3',(buffer)=> {
                        const listener = new THREE.AudioListener();
                        const audio = new THREE.Audio(listener).setBuffer(buffer);
                        audio.position.z = 1;
                        this.helper.add( audio, audioParams );
                        this.scene.add(mmd.mesh);
                    },this.onProgress
                )
            },this.onProgress)
    }
    onProgress( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    }
    addLight() {
        this.scene.add(new THREE.AmbientLight(0xffffff,0.7))
    }
    animate() {
        requestAnimationFrame(()=>this.animate());
        if(this.helper){
            this.helper.update(this.clock.getDelta());
        }
        // this.control.update();
        this.effect.render(this.scene,this.camera);
    }
}

const loaderMMDObject = () => {
    const selfThree= new loaderMMD({queryElement:'.loaderObject'});

    return <div className='loaderObject'></div>
}
export default loaderMMDObject;