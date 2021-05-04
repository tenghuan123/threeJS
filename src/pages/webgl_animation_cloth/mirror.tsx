import React from 'react'
import ThreeBase from '../SelfThreeBase'
import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector'

interface loaderThreeObjectProps {
    queryElement:string;
}

class MirrorThree extends ThreeBase {
    constructor(props:loaderThreeObjectProps) {
        super(props);
        this.addBall()
        this.addAmlight()
        this.addMirror()
    }

    addAmlight() {
        const light = new THREE.AmbientLight(0xffffff,1)
        this.scence.add(light)
    }

    addBall() {
        const geometry = new THREE.SphereBufferGeometry(1, 35, 35)
        const material = new THREE.MeshPhongMaterial({
            envMap: this.scence.background
        })
        const sphere = new THREE.Mesh( geometry, material );
        console.log(sphere)
        this.scence.add( sphere );
    }

    addMirror () {
        const geometry = new THREE.PlaneBufferGeometry(10,10)
        const mirror = new Reflector(geometry)
        mirror.position.set(0,0,-5)
        this.scence.add(mirror)
    }
}

const Mirror = () => {
    const ThreeMirror = new MirrorThree({queryElement:'#Mirror'})
    return <div id="Mirror"></div>
}

export default Mirror