"use client";

import { CameraControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { BufferGeometry, Vector3 } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { Color } from "three";
import { useEffectOnce } from "react-use";
import {
	getSingleColor,
	isGradient,
	SwatchConfiguration,
	templatePNW
} from "./Swatch";

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

export default function ModelViewer({
	swatch,
	modelURL,
	modelFile
}: {
	swatch?: SwatchConfiguration;
	modelURL?: string;
	modelFile?: File;
}) {
	swatch = swatch ?? templatePNW();

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
				console.log(modelURL);
				const request = await fetch(modelURL, { cache: "force-cache" });
				// const request = await fetch(modelURL);

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
				-geometryOffsetFromOrigin.z
			);

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
						camera={{
							position: new Vector3(
								0,
								0,
								STLModel.boundingSphere!.radius * 1.85
							)
						}}>
						<ambientLight intensity={Math.PI / 2} />
						<spotLight
							position={[
								STLModel.boundingSphere!.radius + 2,
								0,
								STLModel.boundingSphere!.radius + 2
							]}
							penumbra={2}
							decay={0}
							intensity={Math.PI}>
							{/* <UtilitySphere
								radius={2}
								color="purple"></UtilitySphere> */}
						</spotLight>
						<spotLight
							position={[
								-(STLModel.boundingSphere!.radius + 2),
								0,
								-(STLModel.boundingSphere!.radius + 2)
							]}
							penumbra={2}
							decay={0}
							intensity={Math.PI}>
							{/* <UtilitySphere
								radius={2}
								color="red"></UtilitySphere> */}
						</spotLight>
						{/* <UtilitySphere radius={2} color="green"></UtilitySphere> */}
						<CameraControls />
						<mesh
							receiveShadow={true}
							geometry={STLModel}
							scale={1}
							position={new Vector3(0, 0, 0)}>
							<meshStandardMaterial
								roughness={0.8}
								flatShading={true}
								color={new Color(getSingleColor(swatch))}
							/>
						</mesh>
					</Canvas>
				</>
			)}
		</>
	);
}
