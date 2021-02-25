import React from 'react'
import * as THREE from 'three';
import { Side } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Touxiang from '../../asset/image/touxiang3.jpg'
import negx from '../../asset/cube/Park2/negx.jpg'
import negy from '../../asset/cube/Park2/negy.jpg'
import negz from '../../asset/cube/Park2/negz.jpg'
import posx from '../../asset/cube/Park2/posx.jpg'
import posy from '../../asset/cube/Park2/posy.jpg'
import posz from '../../asset/cube/Park2/posz.jpg'

const StudyMesh = () => {
    // 元素
    const getLine = () => {
        const geometry = new THREE.Geometry();
        // 添加关键点
        geometry.vertices.push(new THREE.Vector3(1,1,1))
        geometry.vertices.push(new THREE.Vector3(3,3,3))
        // 手动连接点


        const material = new THREE.LineBasicMaterial({
            color:0xff00ff,
            linewidth:10
        });
        const line = new THREE.Line(geometry,material)
        return line;
    }
    
    const getPlance = () => {
        const planceGeometry = new THREE.PlaneGeometry(5,5);
        const loader = loaderTexture()
        
        const material = new THREE.MeshBasicMaterial({
            map:loader,
            side:THREE.DoubleSide
        })
        const Mesh = new THREE.Mesh(planceGeometry, material);
        
        return Mesh;
    }

    const createWorldBg = (scence:THREE.Scene) => {
        const loader = new THREE.CubeTextureLoader();
        scence.background = loader.load([
            posx,negx,posy,negy,posz,negz
        ])

    }
    // 导入材质
    const loaderTexture = () => {
        const loader = new THREE.TextureLoader();
        const touxiang = loader.load(Touxiang);
        return touxiang;
    }
    // 直角坐标系
    const getAxesHelper = () => {
        return new THREE.AxesHelper(5);
    }
    // const line = getLine();
    const plance = getPlance();
    const axesHelper = getAxesHelper();
    // 场景
    const scence = new THREE.Scene();
    // scence.add(line)
    scence.add(plance);
    scence.add(axesHelper);
    createWorldBg(scence);
    // 渲染器
    const renderer = new THREE.WebGLRenderer();
    // 相机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer.setSize( window.innerWidth, window.innerHeight );
    
    const Element = document.querySelector('.studyMesh');

    if(Element){
        Element.appendChild(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
    }
    // 控制器
    const control = new OrbitControls( camera, renderer.domElement );
    
    // 动画
    const animate = () => {
        requestAnimationFrame(animate);

        control.update();
        renderer.render(scence,camera);
    }
    animate();



    return <div className='studyMesh'></div>
}

export default StudyMesh