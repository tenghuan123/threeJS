import React from 'react';
import * as THREE from 'three'
import SelfThreeBase from '../SelfThreeBase';

interface loaderThreeObjectProps {
    queryElement:string;
}

class LightAndShadowThree extends SelfThreeBase{
    PointLight: THREE.PointLight;
    PointLightAnimateFn: () => {x:number,y:number};
    R: number;
    PointLightAnimateFnchildFn: () => void;
    constructor(props:loaderThreeObjectProps){
        super(props);
        this.addAmbientLight();
        this.addMesh(this.getCustomMesh());
        this.addMesh(this.getPlaneMesh());
        this.PointLight = this.getPointLight();
        this.scence.add(this.PointLight);
        this.PointLightAnimateFn = this.PointLightAnimate();
        this.PointLightAnimateFnchildFn = this.PointAnimateFnchild();
        this.animate();
    }

    addAmbientLight() {
        // 定义光线
        const AmbientLight = new THREE.AmbientLight(0xffffff,0.1)
        // 添加到页面中
        this.scence.add(AmbientLight)
    }

    getCustomMesh() {
        const geometry = new THREE.BoxGeometry(1,2,3)
        const material = new THREE.MeshLambertMaterial({
            color:new THREE.Color(0xff00ff)
        })
        
        const mesh = new THREE.Mesh(
            geometry,
            material
        )
        mesh.position.set(0,1,0)
        return mesh
    }

    getPlaneMesh() {
        const geometry = new THREE.PlaneGeometry(500,400)
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(0xeeeeee)
        })

        const mesh = new THREE.Mesh(
            geometry,
            material
        )
        mesh.rotateX(-Math.PI / 2)
        return mesh
    }

    addMesh(mesh:THREE.Mesh) {
        this.scence.add(mesh)
    }

    getPointLight() {
        const light = new THREE.PointLight(0xff0000, 1, 100)
        const lightHelper = new THREE.PointLightHelper(light);
        this.scence.add(lightHelper)
        light.position.set(-50,0,0)
        this.R = Math.sqrt(Math.pow(5,2)*2)
        return light;
    }

    // 模拟太阳的东升西降
    PointLightAnimate() {
        let dep = 0 // 角度
        // 角度转化为 具体的值
        return () => {
            dep += 1
            const value = this.depToValue(dep)
            return {
                x:(Math.cos(value)),
                y:(Math.sin(value))
            }
        } 
    }

    // 防抖函数
    debounce(fn: () => void, awaitTime: number) {
        let timer: NodeJS.Timeout | null = null;
        return () => {
            if(timer != null) {
                return ;
            } else{
               timer = setTimeout(()=>{
                fn()
                timer = null;
            }, awaitTime) 
            }
        }
    }

    depToValue(dep:number) {
        return (dep / 180) * Math.PI
    }

    PointAnimateFnchild() {
        return this.debounce(()=>{
            const value = this.PointLightAnimateFn()
            console.log(value)
            this.PointLight.position.x = value.x * this.R
            this.PointLight.position.y = value.y * this.R
            console.log(this.PointLight.position)
        },500)
    }
    
    animate() {
        requestAnimationFrame(()=>this.animate());
        this.control.update();
        if(this.PointLightAnimateFn != null) {
            this.PointLightAnimateFnchildFn()
        }
        this.renderer.render(this.scence,this.camera);
    }
}

const LightAndShadow = () => {
    const ThreeObject = new LightAndShadowThree({queryElement:'#LightAndShadow'})
    return <div id='LightAndShadow'></div>
}
export default LightAndShadow;