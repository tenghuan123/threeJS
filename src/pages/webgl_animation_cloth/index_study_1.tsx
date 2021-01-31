import React from 'react'
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const webgl_animation_cloth_study1 = () => {

    // scence(场景)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    const Element = document.getElementById('three-canvas');
    if(Element){
        Element.appendChild( renderer.domElement );
    }else{
        document.body.appendChild( renderer.domElement ); 
    }

    // 物体
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    // 控制器
    const control = new OrbitControls( camera, renderer.domElement );


    // 渲染的动画
    const animate = () => {
        requestAnimationFrame( animate );
        // 更新控制器
        control.update();
        renderer.render( scene, camera );
    }
    animate();



    return <div id='three-canvas'></div>
}
export default webgl_animation_cloth_study1