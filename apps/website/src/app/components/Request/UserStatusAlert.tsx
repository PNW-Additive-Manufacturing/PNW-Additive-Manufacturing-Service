import { isAllComplete } from "@/app/Types/Part/Part";
import { isPaid, RequestWithParts } from "@/app/Types/Request/Request";
import { Alert, AlertTitle } from "@mui/material";

export default function UserRequestStatusAlert({
	request
}: {
	request: RequestWithParts;
}) {
	return (
		<>
			{request.isFulfilled && (
				<Alert severity="success">
					The request has been completed and picked up from the{" "}
					<a href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7">
						Design Studio
					</a>
					.
				</Alert>
			)}

			{!request.isFulfilled &&
				isAllComplete(request.parts) &&
				isPaid(request) && (
					<Alert severity="success">
						<AlertTitle>Ready for Pick up</AlertTitle>
						Models are ready to be picked up between 12-5 PM through
						Monday and Friday from the{" "}
						<a
							href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7"
							className="underline">
							Design Studio
						</a>
						.
					</Alert>
				)}

			{isPaid(request) && !isAllComplete(request.parts) && (
				<Alert severity="info">
					<AlertTitle>In Progress</AlertTitle>
					Please allow 1-3 business days for a status update. You will
					receive an email when your items are ready for pick up at
					the{" "}
					<a
						href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7"
						className="underline">
						Design Studio
					</a>
					.
				</Alert>
			)}
		</>
	);
}
