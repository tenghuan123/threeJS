import React from 'react'
import {MMDLoader} from 'three/examples/jsm/loaders/MMDLoader'
import {OutlineEffect} from 'three/examples/jsm/effects/OutlineEffect'
import {MMDAnimationHelper} from 'three/examples/jsm/animation/MMDAnimationHelper'
import * as THREE from 'three'
import SelfThreeBase from '../SelfThreeBase';
const AMMO = require('../ammo')
AMMO().then(ammolib=>{
    window.Ammo = ammolib;
})

interface loaderThreeObjectProps {
    queryElement:string;
}

class loaderMMD extends SelfThreeBase {
    clock: THREE.Clock
    helper: MMDAnimationHelper
    constructor(props:loaderThreeObjectProps){
        super(props);
        this.camera.position.z = 20;
        this.clock = new THREE.Clock()
        this.helper = new MMDAnimationHelper();
        this.loaderObj();
        this.addLight();
        this.renderer = new OutlineEffect(this.renderer,{});
        this.animate();
    }
    loaderObj() {
        const mmd = new MMDLoader();
        const listener = new THREE.AudioListener();
		this.camera.add( listener );
		this.scence.add( this.camera );
        const audioParams = { delayTime: 160 * 1 / 30 };
        mmd.loadWithAnimation(
            '/module/mmd/miku/miku_v2.pmd',
            '/module/mmd/vmds/wavefile_v2.vmd',(mmd)=>{
                console.log(mmd);
                this.helper.add(mmd.mesh,{
                    animation:mmd.animation,
                    physics:true
                })
                mmd.mesh.position.set(0,-10,0)
                this.scence.add(mmd.mesh);
                new THREE.AudioLoader().load(
                    '/module/mmd/audios/wavefile_short.mp3',(buffer)=> {
                        const listener = new THREE.AudioListener();
                        const audio = new THREE.Audio(listener).setBuffer(buffer);
                        this.helper.add( audio, audioParams );
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
        this.scence.add(new THREE.AmbientLight(0xffffff,0.7))
    }
    animate() {
        requestAnimationFrame(()=>this.animate());
        if(this.helper){
            this.helper.update(this.clock.getDelta());
        }
        this.control.update();
        this.renderer.render(this.scence,this.camera);
    }
}

const loaderMMDObject = () => {
    const selfThree= new loaderMMD({queryElement:'.loaderObject'});

    return <div className='loaderObject'></div>
}
export default loaderMMDObject;