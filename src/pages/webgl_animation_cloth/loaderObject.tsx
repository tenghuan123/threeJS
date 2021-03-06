import React from 'react'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import SelfThreeBase from '../SelfThreeBase';

interface loaderThreeObjectProps {
    queryElement:string;
}

class loaderThreeObject extends SelfThreeBase {
    constructor(props:loaderThreeObjectProps){
        super(props);
        this.loaderObj();
    }
    loaderObj() {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load("@/module/gltf/DamagedHelmet/glTF/DamagedHelmet",(res)=>{
            console.log(res);
        },(event)=>{console.log(event)},(Err)=>{console.log(Err)});
    }
}

const loaderObject = () => {
    const selfThree= new loaderThreeObject({queryElement:'.loaderObject'});

    return <div className='loaderObject'></div>
}
export default loaderObject;