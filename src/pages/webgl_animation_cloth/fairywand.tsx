import React, { useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const FairyWand = () => {
    const [width, setwidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    // 针对可能会变化页面的长宽比例
    useEffect(() => {
        window.addEventListener( 'resize', resizeWindow )
        return () => {
            window.removeEventListener( 'resize', resizeWindow )
        }
    }, [])

    const resizeWindow = () => {
        setwidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    // 场景
    const scence = new THREE.Scene();

    // 相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    // 渲染
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    const Element = document.querySelector('.fairywand');
    if(Element){
        Element.appendChild( renderer.domElement );
    } else {
        document.body.appendChild( renderer.domElement );
    }

    // 物体 n角星
    const getStartGeometry = (far:number, near:number, depth:number, count:number) => {
        // 返回一个集合体，接收参数，是星星大小角的熟练...
        // 4个参数
        // far 最远点的长度
        const geometry = new THREE.Geometry();

        let frontPoint = new THREE.Vector3( 0, 0, depth );
        geometry.vertices.push(frontPoint)

        let backPoint = new THREE.Vector3( 0, 0, -depth );
        geometry.vertices.push(backPoint)

        for(let i = 0; i < count + 1; i++) {
            let farPoint = new THREE.Vector3( far, 0, 0 ).applyEuler(new THREE.Euler( 0, 0, Math.PI * 2 * i / count, 'XYZ' ));
            geometry.vertices.push(farPoint)
            let nearPoint = new THREE.Vector3( near, 0, 0).applyEuler(new THREE.Euler( 0, 0, Math.PI * 2* i / count + Math.PI / count, 'XYZ' ))
            geometry.vertices.push(nearPoint)
        }
        // [远，近，远，近...]
        // 画面
        const normal = new THREE.Vector3( 0, 1, 0 )
        const color = new THREE.Color( 0xff00ff )

        for(let i = 0; i < count * 2 ; i++) {
            geometry.faces.push(new THREE.Face3( 0, i+2 , i + 3, normal, color))
            geometry.faces.push(new THREE.Face3( 1, i+2, i+3, normal, color))
        }
        geometry.rotateZ(Math.PI/count/2)

        return geometry;
    }

    // 物体 棒子
    const getCylinder = () => {
        const geometry = new THREE.CylinderBufferGeometry( 0.5, 0.5, 20, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
        const cylinder = new THREE.Mesh( geometry, material );
        return cylinder;
    }

    const start1Geo = getStartGeometry( 2, 1, 0.5, 5 )
    const start2Geo = getStartGeometry( 5, 3, 1.2, 5 )
    const start3Geo = getStartGeometry( 1, 0.5, 0.3, 5 )
    const material = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide
    })
    const start1Mesh = new THREE.Mesh( start1Geo, material);
    const start2Mesh = new THREE.Mesh( start2Geo, material);
    const start3Mesh = new THREE.Mesh( start1Geo, material);
    const start4Mesh = new THREE.Mesh( start3Geo, material);
    const cylinder = getCylinder();
    cylinder.position.y = -10
    start1Mesh.position.set(5,-5,0)
    start3Mesh.position.set(-3,-10,-10)
    start4Mesh.position.set(4,-7,6)

    const obj = new THREE.Object3D();
    obj.add(start1Mesh, start2Mesh, start3Mesh, start4Mesh, cylinder)
    scence.add(obj);

    camera.position.z = 5;

    // 控制器
    const control = new OrbitControls( camera, renderer.domElement );

    // 动画
    const animate = () => {
        requestAnimationFrame( animate );
        obj.children[1].rotation.y -= 0.01;
        obj.children[0].rotation.z += 0.01;
        obj.children[3].rotation.y -= 0.01;
        obj.children[3].rotation.z += 0.01;
        obj.children[2].rotation.y -= 0.01;
        obj.children[2].rotation.z += 0.01;
        obj.rotation.y +=0.01;
        control.update();
        renderer.render( scence, camera );
    }
    animate();

    return <div className='fairywand'>FairyWand</div>
}
export default FairyWand;