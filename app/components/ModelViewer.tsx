"use client";

import {
	AccumulativeShadows,
	CameraControls,
	Center,
	Grid,
	OrthographicCamera,
	RandomizedLight
} from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { LegacyRef, memo, RefObject, useEffect, useRef, useState } from "react";
import {
	BufferGeometry,
	Euler,
	GridHelper,
	MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	Vector3
} from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { Color } from "three";
import { useEffectOnce } from "react-use";
import {
	getSingleColor,
	isGradient,
	SwatchConfiguration,
	templatePNW
} from "./Swatch";
import { detach } from "@react-three/fiber/dist/declarations/src/core/utils";

function UtilitySphere({
	radius,
	position,
	color
}: {
	radius: number;
	position?: Vector3;
	color?: Color;
}) {
	position = position ?? new Vector3(0, 0, 0);
	color = color ?? (Color.NAMES.red as any);

	return (
		<mesh position={position}>
			<sphereGeometry args={[radius]}></sphereGeometry>
			<meshStandardMaterial color={color}></meshStandardMaterial>
		</mesh>
	);
}

// // https://codesandbox.io/p/sandbox/sew669?file=%2Fsrc%2FApp.js%3A147%2C1-162%2C1
// function Ground() {
// 	const gridConfig = {
// 		cellSize: 0.5,
// 		cellThickness: 0.5,
// 		cellColor: "#ffffff",
// 		sectionSize: 3,
// 		sectionThickness: 1,
// 		sectionColor: "#9d4b4b",
// 		fadeDistance: 30,
// 		// fadeStrength: 1,
// 		followCamera: false,
// 		infiniteGrid: true
// 	};
// 	return <Grid position={[0, 0, 0]} args={[256, 256]} {...gridConfig} />;
// }

export function EngineeringCamera({
	focusedGeometry
}: {
	focusedGeometry: BufferGeometry;
}) {
	const cameraRef = useRef<CameraControls>();

	useFrame((_, delta) => {
		if (cameraRef.current) {
			cameraRef.current!.polarAngle = Math.PI / 3;
			cameraRef.current!.rotate(0.1 * delta, 0, true);
			cameraRef.current!.fitToSphere(
				focusedGeometry.boundingSphere!,
				true
			);
		}
	});

	useEffect(() => {
		cameraRef.current!.azimuthAngle = Math.PI / 4;
		cameraRef.current!.fitToSphere(focusedGeometry.boundingSphere!, false);
		console.log("Updated to fit!");
	}, []);

	return (
		<>
			<OrthographicCamera
				makeDefault={true}
				frames={15}
				position={new Vector3(200, 200, 200 / 2)}
				// TODO: Use proper zoom calculation
				zoom={focusedGeometry.boundingSphere!.radius / 35}>
				<spotLight
					castShadow={false}
					position={[0, 0, 0]}
					decay={0.05}
					intensity={Math.PI}></spotLight>
			</OrthographicCamera>
			<CameraControls ref={cameraRef as any} boundaryFriction={0} />
		</>
	);
}
export default function ModelViewer({
	swatch,
	modelURL,
	modelFile,
	modelRotation,
	moveable,
	showOrientation
}: {
	swatch?: SwatchConfiguration;
	modelURL?: string;
	modelFile?: File;
	modelRotation?: Euler;
	moveable?: boolean;
	showOrientation?: boolean;

	onClickOrientation?: (rotation: Euler) => void;
}) {
	showOrientation = showOrientation ?? false;
	moveable = moveable ?? true;
	swatch = swatch ?? templatePNW();

	console.log(swatch.name);

	// None supplied? Use the default PNW Gold.
	// const color = ?? new Color("#b1810b");
	// color = new Color("#b1810b");

	// This logic clamps the RGB values to prevent white-on-white models.
	// if (color.r > 0.7 && color.g > 0.7 && color.b > 0.7) {
	// 	color = new Color("rgb(180, 180, 180)");
	// }

	const [STLModel, setSTLModel] = useState<BufferGeometry | undefined>(
		undefined
	);
	const [isSTLLoading, setSTLLoading] = useState(false);

	async function loadModelSTL() {
		setSTLLoading(true);
		try {
			let modelArrayBuffer: ArrayBuffer;
			if (modelFile != undefined) {
				modelArrayBuffer = await modelFile.arrayBuffer();
			} else if (modelURL != undefined) {
				const request = await fetch(modelURL, { cache: "force-cache" });

				if (!request.ok) {
					console.error("Request failed!", request.status);
				}

				modelArrayBuffer = await (await request.blob()).arrayBuffer();
			} else {
				throw new TypeError(
					"Model Viewer must be supplied with either a URL or File!"
				);
			}

			const result = new STLLoader();
			const parsedSTLGeometry = result.parse(modelArrayBuffer);

			parsedSTLGeometry.computeBoundingSphere();
			parsedSTLGeometry.computeBoundingBox();

			const geometryOffsetFromOrigin =
				parsedSTLGeometry.boundingSphere!.center;
			parsedSTLGeometry.translate(
				-geometryOffsetFromOrigin.x,
				-geometryOffsetFromOrigin.y,
				-parsedSTLGeometry.boundingBox!.min.z
				// -geometryOffsetFromOrigin.z
			);

			parsedSTLGeometry.computeBoundingSphere();
			parsedSTLGeometry.computeBoundingBox();

			setSTLModel(parsedSTLGeometry);
		} catch (error) {
			console.error(
				"Something went wrong loading the model!",
				error,
				modelURL
			);
		} finally {
			setSTLLoading(false);
		}
	}

	// Uncomment to load instantly.
	useEffectOnce(() => {
		if (STLModel == undefined && !isSTLLoading) {
			loadModelSTL();
		}
	});

	Object3D.DEFAULT_UP = new Vector3(0, 0, 1);

	return (
		<>
			{STLModel == undefined ? (
				isSTLLoading ? (
					<div className="flex justify-center align-middle items-center h-full w-full">
						<div className="animate-ping w-8 h-8 bg-pnw-gold "></div>
					</div>
				) : (
					<div className="flex justify-center align-middle items-center h-full w-full">
						<button
							className="px-4 py-2 text-sm font-normal rounded-sm w-fit m-0"
							type="button"
							onClick={loadModelSTL}>
							View Model
						</button>
					</div>
				)
			) : (
				<>
					<Canvas
						className="rounded-lg"
						frameloop="demand"
						shadows
						style={{
							width: "100%",
							height: "100%",
							backgroundColor: "#efefef"
						}}>
						<EngineeringCamera
							focusedGeometry={STLModel}></EngineeringCamera>

						<ambientLight></ambientLight>

						{/* <UtilitySphere
							radius={1}
							position={
								STLModel.boundingBox!.min
							}></UtilitySphere>
						<UtilitySphere
							radius={1}
							color={new Color("green")}
							position={
								STLModel.boundingBox!.max
							}></UtilitySphere> */}

						<mesh
							receiveShadow
							material={
								new MeshStandardMaterial({ color: "#efefef" })
							}
							position={new Vector3(0, 0, -0.1)}>
							{/* <axesHelper
								args={[256]}
								position={new Vector3(-132, -132)}></axesHelper> */}
							<planeGeometry args={[256, 256]}></planeGeometry>
							<gridHelper
								position={new Vector3(0, 0, 0.05)}
								args={[256, 256 / 23, "#b1810b", "#a6a6a6"]}
								rotation={new Euler(Math.PI / 2)}></gridHelper>
						</mesh>

						{/* <mesh position={STLModel.boundingSphere!.center}>
							<meshStandardMaterial
								wireframe
								color={"green"}></meshStandardMaterial>
							<sphereGeometry
								args={[
									STLModel.boundingSphere!.radius
								]}></sphereGeometry>
						</mesh> */}

						<mesh
							castShadow={true}
							receiveShadow={true}
							geometry={STLModel}
							scale={1}
							position={new Vector3(0, 0, 0)}>
							<meshStandardMaterial
								metalness={0.5}
								color={
									new Color(getSingleColor(swatch))
								}></meshStandardMaterial>
							{/* <meshLambertMaterial
								reflectivity={1}
								flatShading={false}
								color={new Color(getSingleColor(swatch))}
							/> */}

							<spotLight
								onUpdate={(me) => me.lookAt(new Vector3())}
								position={[-128, -128, 128 * 2]}
								decay={0.05}
								castShadow
								intensity={Math.PI * 2}>
								{/* <UtilitySphere radius={5}></UtilitySphere> */}
							</spotLight>
							{/* <spotLight
								onUpdate={(what) => what.lookAt(new Vector3())}
								position={[128, 128, 128]}
								decay={0.05}
								intensity={Math.PI * 2}>
								<UtilitySphere radius={5}></UtilitySphere>
							</spotLight> */}
						</mesh>
					</Canvas>
				</>
			)}
		</>
	);
}
