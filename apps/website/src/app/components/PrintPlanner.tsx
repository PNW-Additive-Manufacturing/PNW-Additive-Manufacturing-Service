import { MutableRefObject, ReactElement, useContext, useRef, useState } from "react";
import { Box3, BoxGeometry, BufferAttribute, BufferGeometry, Color, EdgesGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera, PerspectiveCamera, PointLight, MathUtils as TMathUtils, Vector3 } from "three";
import { useFrame, Canvas, useThree } from "@react-three/fiber";
import { Caveat } from "next/font/google";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function ModelMesh({ ref }: { ref: React.Ref<Mesh<BufferGeometry>> }) {
    // ref = ref == undefined ? useRef<Mesh>() : ref;
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    const [boundingGeometry, setBoundingGeometry] = useState<BoxGeometry | undefined>(undefined);

    // Subscribe this component to the render-loop, rotate the mesh every frame
    // useFrame((state, delta) => {
    //     // ref.current!.rotation.y += delta / 2;
    //     // ref.current!.position.y = de lta * 100;

    //     const refAABB = new Box3().setFromObject(ref.current!); 
    //     var meshBoxDimensions = refAABB.max.clone().sub(refAABB.min);

    //     setBoundingGeometry(new BoxGeometry(meshBoxDimensions.x, meshBoxDimensions.y, meshBoxDimensions.z));
    // });

    // const geometryRef = useRef<BufferGeometry>(geometry);

    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: Color.NAMES.red });

    // Return the view, these are regular Threejs elements expressed in JSX
    return <group>
        <mesh
            ref={ref}
            scale={1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}
            // rotation={[0, TMathUtils.degToRad(45), 10]}
            geometry={geometry}
            material={material}
            castShadow={true}
            position={new Vector3(0, 1, 0)}/>
        { boundingGeometry == undefined ? undefined : <mesh position={new Vector3(0, 1, 0)} geometry={boundingGeometry}>
            <meshBasicMaterial args={[{color: Color.NAMES.green, opacity: 0.5, transparent: true}]}></meshBasicMaterial>
        </mesh> }
    </group>
    // return <mesh
    //     ref={ref}
    //     scale={2}
    //     onClick={(event) => click(!clicked)}
    //     onPointerOver={(event) => hover(true)}
    //     onPointerOut={(event) => hover(false)}>
    //     <boxGeometry args={[2, 2, 2]}></boxGeometry>
    //     {/* <bufferGeometry ref={geometryRef}/> */}
    //     <meshLambertMaterial color={hovered ? 'hotpink' : 'orange'} emissive="hotpink" />
    // </mesh>
}

// function DebugBoundingBox({ children }: { children: ReactElement<Mesh> }): JSX.Element {
//     React.Children.map(children, child => {
        
//     });
// }

function BoundingBoxToEdgeGeometry(box: Box3): EdgesGeometry {
    const dimensions = box.max.clone().sub(box.min);

    return new EdgesGeometry(new BoxGeometry(dimensions.x, dimensions.y, dimensions.z));
}

function PrintScene({}: {}): JSX.Element {
    // Element references
    const meshRef = useRef<Mesh>(null);
    const lightRef = useRef<PointLight>();

    // useThree(({camera}) => {
    //     camera.lookAt(new Vector3(0, 0, 0));
    // });

    var outlineGeometry = new EdgesGeometry(new BoxGeometry(20, 20, 20));
    const outlineMaterial = new MeshBasicMaterial({ 
        color: Color.NAMES.blueviolet
    })

    return <group>
        {/* <mesh receiveShadow={true} position={new Vector3(0, -0.125, 0)}>
            <boxGeometry ref={} args={[20, 0.25, 20]}></boxGeometry>
            <meshBasicMaterial args={[{color: Color.NAMES.gray, opacity: 0.1, transparent: true}]}></meshBasicMaterial>
        </mesh> */}
        <lineSegments position={new Vector3(0, 10, 0)} args={[outlineGeometry, outlineMaterial]}></lineSegments>
        <gridHelper args={[20, 20, new Color(0.5, 0.5, 0.5), new Color(0.5, 0.5, 0.5)]}></gridHelper>
        <ambientLight/>
        <mesh>
            <ModelMesh ref={meshRef}></ModelMesh>
        </mesh>
    </group>
}

export default function PrintPlanner({}: {}) {
    // const ref = useRef<Canvas>();

    const camera = new PerspectiveCamera(30);
    camera.position.set(30, 20, 0);
    camera.lookAt(new Vector3(0, 0, 0));

    return (
        <div style={{width: "100%", height: "600px"}}>
            <div className="w-fit h-2/5 bg-slate-50 rounded-md p-3 grid gap-4">
                <div style={{gridColumn: 1}}>
                    <button className="rounded-sm p-4 font-medium block">U</button>
                    <button className="rounded-sm p-4 font-medium block">R</button>
                    <button className="rounded-sm p-4 font-medium block">Rem</button>
                </div>
                <Canvas camera={camera} className="w-20" style={{gridColumn: 2}}>
                    <PrintScene></PrintScene>
                </Canvas>
                {/* <p>Dimensions: 0x0</p> */}
            </div>
            {/* <input type="file" className="bg-gray-600 mb-4 w-fit" style={{position: "relative", right: "10px", top: "10px"}}></input> */}
        </div>
    )
}