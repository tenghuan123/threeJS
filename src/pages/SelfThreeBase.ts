import React, { DOMElement } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import negx from '../asset/cube/Park2/negx.jpg'
import negy from '../asset/cube/Park2/negy.jpg'
import negz from '../asset/cube/Park2/negz.jpg'
import posx from '../asset/cube/Park2/posx.jpg'
import posy from '../asset/cube/Park2/posy.jpg'
import posz from '../asset/cube/Park2/posz.jpg'

interface SelfThreeBaseProps {
    /* 选中的DOM对象，会在该对象中创建对应的canvas */
    queryElement:string;
}

// 基本的three一整套模板
class SelfThreeBase {
    scence: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    control: OrbitControls;
    el: Element;
    constructor(props:SelfThreeBaseProps) {
        this.el = this.initQueryElement(props.queryElement) || document.body;
        this.scence = new THREE.Scene();
        this.camera = this.initCamera();
        this.renderer = new THREE.WebGLRenderer();

        this.Initrenderer();
        this.control = new OrbitControls(this.camera,this.renderer.domElement);
        this.scenceInit();
        this.animate();
    }
    scenceInit() {
        this.createWorldBg(this.scence);
        const AxesHelper = this.getAxesHelper();
        this.scence.add(AxesHelper);
    }
    // 直角坐标系
    getAxesHelper(){
        return new THREE.AxesHelper(5);
    }
    initQueryElement(query:string) {
        const domElement = document.querySelector(query);
        return domElement;
    }
    Initrenderer() {
        this.rendererDomSize();
        this.el.appendChild(this.renderer.domElement);
    }
    // 设置渲染比例
    rendererDomSize() {
        this.renderer.setSize(window.innerWidth,window.innerHeight);
    }

    // 相机的初始化工作
    initCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        return camera;
    }
    // 世界6面的贴图
    createWorldBg(scence:THREE.Scene) {
        const loader = new THREE.CubeTextureLoader();
        scence.background = loader.load([
            posx,negx,posy,negy,posz,negz
        ])
    }

    // 动画
    animate() {
        requestAnimationFrame(()=>this.animate());
        this.control.update();
        this.renderer.render(this.scence,this.camera);
    }
}

export default SelfThreeBase;