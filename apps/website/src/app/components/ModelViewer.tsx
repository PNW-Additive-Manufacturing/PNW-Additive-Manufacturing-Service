import { Ref, useRef, useState } from 'react';
import { Camera, Canvas, useFrame, useThree } from '@react-three/fiber';
import { BufferGeometry, Color, Euler, Group, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3DEventMap, PerspectiveCamera, SpotLight, Vector2, Vector3 } from 'three';

export default function ModelViewer({models, volume}: {
    models: [{name: string, position: Vector3, rotation: Euler, model: BufferGeometry}], 
    volume: Vector3}) {
    const scene = useRef<Group<Object3DEventMap>>(null); //add null to fix type issue in return <group ref={scene}>

    useThree(state => {
        state.camera = new PerspectiveCamera(40);
        state.camera.position.set(-20, volume.z/2+50, volume.x + 30);
        state.camera.lookAt(new Vector3(0, 0, 0))
    });

    useFrame((state, delta, xrFrame) => {
        if (scene.current == null) return;
        scene.current!.rotateY(0.20 * delta);
    });

    return <group ref={scene}>
        <ambientLight intensity={1}/> 

        {/* Bed */}
        <group>
            <mesh receiveShadow position={new Vector3(0, -1.1, 0)}>
                <boxGeometry args={[volume.x + 10, 1, volume.y + 10]}></boxGeometry>
                <meshStandardMaterial color={new Color(2, 2, 2)} opacity={0}></meshStandardMaterial>
            </mesh>
            <mesh position={new Vector3(0, -1, 0)}>
                <boxGeometry args={[volume.x, 1, volume.y]}></boxGeometry>
                <meshStandardMaterial color={new Color(5, 5, 5)} opacity={0}></meshStandardMaterial>
            </mesh>
            <gridHelper position={new Vector3(0, 0, 0)} args={[volume.x, volume.x / 10, new Color(0.4, 0.4, 0.4), new Color(0.4, 0.4, 0.4)]}></gridHelper>
        </group>
        
        <axesHelper position={new Vector3(-volume.x/2, 0.01, -volume.y/2)} args={[volume.x]}></axesHelper>

        {/* Models */}
        <group>
            {models.map(entry => <mesh
                visible={true}
                castShadow={true} 
                receiveShadow={true}
                geometry={entry.model}
                position={entry.position}
                rotation={entry.rotation}
                material={new MeshStandardMaterial({color: "cyan"})}
                userData={{name: entry.name}}/>)}
        </group>
    </group>
}