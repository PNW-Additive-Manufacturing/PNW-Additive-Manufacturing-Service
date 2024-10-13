import HorizontalWrap from "../components/HorizontalWrap";
import { RegularCheckmark, RegularWarning } from "lineicons-react";
import { currentDay, isOpen, weekdays, weeklySchedule } from "../components/Schedule";

export default function Team() {
	return (
		<>
			<HorizontalWrap>
				<h1 className="text-3xl tracking-wide font-light">Pickup Schedule</h1>
				<p className="mt-2">The Additive Manufacturing Service is available throughout the <span className="font-semibold">Fall</span> and <span className="font-semibold">Spring</span> semesters and confines with the <a className="underline" href="https://www.pnw.edu/registrar/academic-schedule/">PNW Academic Calendar</a>.</p>
				<hr />

				<div className="out bg-white px-4 lg:px-6 py-4 mt-4 lg:flex items-center gap-2 mb-8">
					{isOpen ?
						<>
							<RegularCheckmark className="fill-pnw-gold max-lg:hidden"></RegularCheckmark>
							<span className="font-semibold">One of our team members are at the Design Studio</span> You can come and pickup your completed requests!
						</>
						:
						<>
							<RegularWarning className="fill-pnw-gold max-lg:hidden"></RegularWarning>
							<span className="font-semibold">We are currently Closed</span> Please check back during our regular business hours.
						</>}
				</div>

				<div className="mt-4 grid lg:grid-cols-7 max-lg:flex-col w-full gap-6">
					{weeklySchedule.map((item: any, i: number) => <div className={`lg:min-h-48 flex-grow out bg-white text-black`}>
						<p className={`px-4 py-2 w-full bg-gray-200 ${currentDay == i ? "bg-pnw-gold text-white" : "text-opacity-50"}`}>{weekdays[i]}</p>
						<div className="px-4 py-2">
							{item == null ? <>Closed</> : <>
								{(item.open as Date).toLocaleTimeString("en-us", { hour: '2-digit', minute: '2-digit' })}
								{" - "}
								{(item.close as Date).toLocaleTimeString("en-us", { hour: '2-digit', minute: '2-digit' })}
							</>}
						</div>
					</div>
					)}
				</div>
			</HorizontalWrap>
		</>
	);
}
