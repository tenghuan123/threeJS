import React from 'react'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import SelfThreeBase from '../SelfThreeBase';
// import DamagedHelmet from '@/module/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf'

interface loaderThreeObjectProps {
    queryElement:string;
}

class loaderThreeObject extends SelfThreeBase {
    constructor(props:loaderThreeObjectProps){
        super(props);
        this.loaderObj();
        this.addLight();
    }
    loaderObj() {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/module/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',(res)=>{
            this.scence.add(res.scene);
            this.scence.traverse(mesh => {
                if(mesh.isMesh){
                    mesh.material.side = THREE.DoubleSide;
                   mesh.material.envMap = this.scence.background; 
                }
            })
        },(event)=>{console.log(event)},(Err)=>{console.log(Err)});
    }
    addLight() {
        this.scence.add(new THREE.AmbientLight(0xffffff,0.7))
    }
}

const loaderObject = () => {
    const selfThree= new loaderThreeObject({queryElement:'.loaderObject'});

    return <div className='loaderObject'></div>
}
export default loaderObject;