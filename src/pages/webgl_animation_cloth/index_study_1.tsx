import React from 'react'
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const webgl_animation_cloth_study1 = () => {

    // scence(场景)
    const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const camera = new THREE.OrthographicCamera( window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000 )
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    const Element = document.getElementById('three-canvas');
    if(Element){
        Element.appendChild( renderer.domElement );
    }else{
        document.body.appendChild( renderer.domElement ); 
    }

    // 物体
    // 立体矩形
    const getBoxGeometry = () => {
        // 创建立方体 网格体 没有单位
        const BoxGeometry = new THREE.BoxGeometry( 1, 2, 3, 1, 2, 3 );
        // 根据分段情况，创建网格体
        const frameGeometry = new THREE.WireframeGeometry( BoxGeometry );
        // 根据网格，生成线条
        const line = new THREE.LineSegments( frameGeometry );
        // 基础简单材质
        const mateial = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh( BoxGeometry, mateial );
        return line;
    }
    // 直角坐标系
    const getAxesHelper = () => {
        return new THREE.AxesHelper(5);
    }

    // 随机三个点形成一个面
    const getPlane = () => {
        // 生成对应的三个点
        const geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3( 1, 0, 0 ))
        geometry.vertices.push(new THREE.Vector3( 0, 1, 0 ))
        geometry.vertices.push(new THREE.Vector3( 0, 0, 1 ))
        geometry.vertices.push(new THREE.Vector3( 1, 1, 1 ))
        console.log(geometry);
        const normal = new THREE.Vector3( 0, 1, 0 )
        const color = new THREE.Color( 0xff00ff )
        // 生成了一个面，并且添加到模型中
        geometry.faces.push(new THREE.Face3( 0, 1, 2, normal, color ))
        geometry.faces.push(new THREE.Face3( 3, 1, 2, normal, color ))
        geometry.faces.push(new THREE.Face3( 0, 3, 2, normal, color ))
        geometry.faces.push(new THREE.Face3( 0, 1, 3, normal, color ))
        const Materials = new THREE.MeshNormalMaterial({
            side: THREE.DoubleSide
        })

        // geometry.faces
        return new THREE.Mesh( geometry, Materials );
    }

    const axesHelper = getAxesHelper();
    const cube = getBoxGeometry();
    const onePlane = getPlane();
    
    scene.add( onePlane );
    // scene.add( cube );
    scene.add( axesHelper );

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