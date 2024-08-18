"use client";

import {
	RegularArrowLeft,
	RegularArrowRight,
	RegularArrowsHorizontal,
	RegularChevronLeft,
	RegularChevronRight
} from "lineicons-react";
import { useEffect, useState } from "react";

export default function Gallery({
	slides,
	buttonStyle,
	autoplay
}: {
	slides: JSX.Element[];
	autoplay?: boolean;
	buttonStyle?: "compact" | "sphere" | "side-by-side";
}) {
	buttonStyle = buttonStyle ?? "sphere";

	const [doAutoplay, setAutoplay] = useState(autoplay ?? false);
	const [currentSlide, setCurrentSlide] = useState<number>(0);

	const nextSlide = () => setCurrentSlide((currentSlide + 1) % slides.length);
	const previousSlide = () =>
		setCurrentSlide(Math.abs((currentSlide - 1) % slides.length));

	let buttonElement: JSX.Element;
	switch (buttonStyle) {
		case "sphere":
			buttonElement = (
				<div className="flex px-2 lg:justify-center items-center mt-4 gap-6">
					<button
						disabled={slides.length == 1}
						className="h-fit w-fit mb-0 bg-gray-200 rounded-full p-4"
						onClick={() => {
							previousSlide();
							setAutoplay(false);
						}}>
						<RegularChevronLeft className="fill-cool-black w-auto h-auto"></RegularChevronLeft>
					</button>
					{/* <div>
						{currentSlide + 1} / {slides.length}
					</div> */}
					<button
						disabled={slides.length == 1}
						className="h-fit w-fit mb-0 bg-gray-200 rounded-full p-4"
						onClick={() => {
							nextSlide();
							setAutoplay(false);
						}}>
						<RegularChevronRight className="fill-cool-black w-auto h-auto"></RegularChevronRight>
					</button>
				</div>
			);
			break;
		case "side-by-side":
			buttonElement = (
				<div className="flex flex-col items-center mt-4 gap-4">
					<button
						disabled={slides.length == 1}
						className="h-fit w-fit mb-0 bg-gray-200 rounded-full p-4"
						onClick={() => {
							previousSlide();
							setAutoplay(false);
						}}>
						<RegularChevronLeft className="fill-cool-black w-auto h-auto"></RegularChevronLeft>
					</button>
					<button
						disabled={slides.length == 1}
						className="h-fit w-fit mb-0 bg-gray-200 rounded-full p-4"
						onClick={() => {
							nextSlide();
							setAutoplay(false);
						}}>
						<RegularChevronRight className="fill-cool-black w-auto h-auto"></RegularChevronRight>
					</button>
				</div>
			);
			break;
		case "compact":
			buttonElement = (
				<div className="flex items-center h-auto gap-2 mt-2 px-5 pt-1">
					{slides.length == 1 ? (
						<>
							<button
								disabled={true}
								className="mb-0 bg-gray-200 p-2 w-fit px-4">
								<RegularArrowsHorizontal className="fill-cool-black w-auto h-auto mx-auto" />
							</button>
						</>
					) : (
						<>
							<button
								disabled={slides.length == 1}
								className="mb-0 bg-gray-200 p-2 w-fit px-4"
								onClick={() => {
									previousSlide();
									setAutoplay(false);
								}}>
								<RegularArrowLeft className="fill-cool-black w-auto h-auto mx-auto" />
							</button>
							<button
								disabled={slides.length == 1}
								className="mb-0 bg-gray-200 p-2 w-fit px-4"
								onClick={() => {
									nextSlide();
									setAutoplay(false);
								}}>
								<RegularArrowRight className="fill-cool-black w-auto h-auto mx-auto" />
							</button>
						</>
					)}

					<span className="text-xs">
						{currentSlide + 1} / {slides.length}
					</span>
				</div>
			);
			break;
	}

	useEffect(() => {
		if (doAutoplay) {
			const interval = setInterval(nextSlide, 7500);
			return () => clearInterval(interval);
		}
	});

	return (
		<div
			className={`w-full ${
				buttonStyle == "side-by-side" && "flex"
			} gap-2 items-center`}>
			<div className="overflow-hidden w-full">
				{slides.map((slide, index) => (
					<div
						className={`${
							index == currentSlide
								? "block opacity-100"
								: "hidden opacity-0"
						} w-full transition-opacity duration-200 overflow-hidden`}>
						{slide}
					</div>
				))}
			</div>
			<div className="relative">{buttonElement}</div>
		</div>
	);
}
