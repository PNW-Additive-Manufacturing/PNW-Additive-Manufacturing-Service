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
import { RegularReload } from "lineicons-react";

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

// let loadedCount = 0;

export function EngineeringCamera({
	focusedGeometry
}: {
	focusedGeometry: BufferGeometry;
}) {
	const cameraRef = useRef<CameraControls>();

	// useFrame((_, delta) => {
	// 	if (cameraRef.current) {
	// 		cameraRef.current!.polarAngle = Math.PI / 3;
	// 		cameraRef.current!.rotate(0.1 * delta, 0, true);
	// 		cameraRef.current!.fitToSphere(
	// 			focusedGeometry.boundingSphere!,
	// 			true
	// 		);
	// 	}
	// });

	// TODO: Unsure how to use a frame once besides this?
	const [zoomed, setZoomed] = useState(false);
	useFrame(() => {
		if (!zoomed) {
			cameraRef.current!.rotatePolarTo(-Math.PI, false);
			cameraRef.current!.fitToSphere(focusedGeometry.boundingSphere!, false);
			cameraRef.current!.rotateAzimuthTo(0);
			setZoomed(true);
		}
	});

	return (
		<>
			<OrthographicCamera
				makeDefault={true}
				frames={15}
				position={new Vector3(200, 200, 200 / 2)}
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
	modelSize,
	modelRotation,
	moveable,
	isAvailable,
	showOrientation
}: {
	swatch?: SwatchConfiguration;
	modelURL?: string;
	modelFile?: File;
	modelSize?: number;
	modelRotation?: Euler;
	moveable?: boolean;
	isAvailable?: boolean;
	showOrientation?: boolean;

	onClickOrientation?: (rotation: Euler) => void;
}) {
	showOrientation = showOrientation ?? false;
	moveable = moveable ?? true;
	swatch = swatch ?? templatePNW();

	isAvailable ??= true;

	// None supplied? Use the default PNW Gold.
	// const color = ?? new Color("#b1810b");
	// color = new Color("#b1810b");

	// This logic clamps the RGB values to prevent white-on-white models.
	// if (color.r > 0.7 && color.g > 0.7 && color.b > 0.7) {
	// 	color = new Color("rgb(180, 180, 180)");
	// }

	const [loadingError, setLoadingError] = useState<string | null>(null);
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

			parsedSTLGeometry.boundingSphere!.radius += parsedSTLGeometry.boundingSphere!.radius * 0.075;

			setSTLModel(parsedSTLGeometry);
		} catch (error) {
			console.error(
				"Something went wrong loading the model!",
				error,
				modelURL
			);
			setLoadingError(`${error}`);
		} finally {
			setSTLLoading(false);
		}
	}

	const divRef = useRef<HTMLDivElement>(null);

	// Uncomment to load instantly.
	useEffectOnce(() => {
		const divBounds = divRef.current!.getBoundingClientRect();
		const isVisible = (divRef.current?.checkVisibility() ?? true)
			&& divBounds.top >= 0
			&& divBounds.left >= 0
			&& divBounds.bottom <= (window.innerHeight || document.documentElement.clientHeight)
			&& divBounds.right <= (window.innerWidth || document.documentElement.clientWidth);

		// if (STLModel == undefined && !isSTLLoading && isVisible && loadedCount <= 1) {
		if (STLModel == undefined && !isSTLLoading && isVisible && isAvailable) {
			// loadedCount += 1;
			loadModelSTL();
		}
	});

	Object3D.DEFAULT_UP = new Vector3(0, 0, 1);

	return (
		<div className="w-full h-full" ref={divRef}>
			{STLModel == undefined ? (
				isSTLLoading ? (
					<div className="flex justify-center align-middle items-center h-full w-full">
						<div className="animate-ping w-8 h-8 bg-pnw-gold "></div>
					</div>
				) : loadingError ? <div className="flex justify-center align-middle items-center h-full w-full">
					<button
						className="px-4 py-2 text-sm font-normal rounded-sm w-fit m-0 bg-red-400"
						type="button"
						onClick={loadModelSTL}>
						Encountered an Issue<RegularReload className="ml-2 inline fill-white" />
					</button>
				</div> : isAvailable ? (
					<div className="flex justify-center align-middle items-center h-full w-full">
						<button
							className="px-4 py-2 text-xs font-normal rounded-sm w-fit m-0"
							type="button"
							onClick={loadModelSTL}>
							View Model {modelSize && <span className="max-lg:hidden">({Math.round(modelSize / 1000)} kB)</span>}
						</button>
					</div>
				) : <div className="flex justify-center align-middle items-center h-full w-full">
					<button
						className="px-4 py-2 text-sm font-normal rounded-sm w-fit m-0"
						disabled={true}
						type="button">
						Not Available
					</button>
				</div>
			) : (
				<Canvas
					className="rounded-lg bg-background block w-full h-full"
					frameloop="demand"
					shadows>
					<EngineeringCamera
						focusedGeometry={STLModel}></EngineeringCamera>

					<ambientLight></ambientLight>

					<group>
						<mesh
							receiveShadow
							material={
								new MeshStandardMaterial({ color: "#efefef" })
							}
							position={new Vector3(0, 0, STLModel.boundingBox!.max.x > 2 ? -0.01 : -0.0001)}>

							<planeGeometry args={[256, 256]}></planeGeometry>
						</mesh>

						<mesh>
							<gridHelper
								args={[256, 10, "#b1810b", "#a6a6a6"]}
								rotation={new Euler(Math.PI / 2)}></gridHelper>
						</mesh>
					</group>

					<mesh
						castShadow={true}
						receiveShadow={true}
						geometry={STLModel}
						scale={1}
						position={new Vector3(0, 0, 0)}>
						{/* <UtilitySphere radius={0.001}></UtilitySphere> */}
						<meshStandardMaterial
							metalness={0.5}
							color={
								// new Color("#b1810b")
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
						</spotLight>
					</mesh>
				</Canvas>
			)}
		</div>
	);
}
