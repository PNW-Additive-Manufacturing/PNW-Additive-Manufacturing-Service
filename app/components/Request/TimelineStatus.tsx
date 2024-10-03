import {
	getRequestStatus,
	RequestWithParts
} from "@/app/Types/Request/Request";

export default function TimelineRequestStatus({
	request
}: {
	request: RequestWithParts;
}) {
	const requestStatus = getRequestStatus(request);

	return (
		<>
			<div className="flex justify-between">
				<div className="w-full h-fit bg-blue-500 relative mb-12">
					<div className="absolute w-full flex justify-center items-center">
						<div className="bg-gray-300 w-full h-3 absolute rounded-l-xl"></div>
						<div className="z-10 w-fit h-12 px-4 bg-pnw-gold text-white rounded-full flex justify-center items-center">
							Submitted
						</div>
					</div>
				</div>
				<div className="w-full h-fit bg-blue-500 relative mb-12">
					<div className="absolute w-full flex justify-center items-center">
						<div className="bg-gray-300 w-full h-3 absolute"></div>
						<div className="z-10 w-fit h-12 px-4 bg-pnw-gold text-white rounded-full flex justify-center items-center">
							Approved
						</div>
					</div>
				</div>
				<div className="w-full h-fit bg-blue-500 relative mb-12">
					<div className="absolute w-full flex justify-center items-center">
						<div className="bg-gray-300 w-full h-3 absolute"></div>
						<div className="z-10 w-fit h-12 px-4 bg-gray-500 text-white rounded-full flex justify-center items-center">
							Printing
						</div>
					</div>
				</div>
				<div className="w-full h-fit bg-blue-500 relative mb-12">
					<div className="absolute w-full flex justify-center items-center">
						<div className="bg-gray-300 w-full h-3 absolute"></div>
						<div className="z-10 w-fit h-12 px-4 bg-gray-500 text-white rounded-full flex justify-center items-center">
							Printed
						</div>
					</div>
				</div>
				<div className="w-full h-fit bg-blue-500 relative mb-12">
					<div className="absolute w-full flex justify-center items-center">
						<div className="bg-gray-300 w-full h-3 absolute"></div>
						<div className="z-10 w-fit h-12 px-4 bg-gray-500 text-white rounded-full flex justify-center items-center">
							Fulfilled
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
