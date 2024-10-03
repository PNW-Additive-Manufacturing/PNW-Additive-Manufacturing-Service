"use server";

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { RegularCart, RegularLicense } from "lineicons-react";
import db from "@/app/api/Database";
import GenericPrinterIcon from "@/app/components/icons/GenericPrinterIcon";
import FilamentSpoolIcon from "@/app/components/icons/FilamentSpoolIcon";
import { AccountPermission } from "@/app/Types/Account/Account";
import getConfig from "@/app/getConfig";

const envConfig = getConfig();

export default async function Maintainer() {
	let jwtPayload = await getJwtPayload();

	let permission: AccountPermission | null;
	try {
		permission = jwtPayload?.permission as AccountPermission;
	} catch {
		permission = null;
	}

	const orderCount = (await db`select COUNT(*) from Request`)[0] as {
		count: number;
	};
	const userCount = (await db`select COUNT(*) from Account`)[0] as {
		count: number;
	};

	return (
		<>
			<div className="text-3xl mb-10">
				Welcome, {jwtPayload?.firstname} {jwtPayload?.lastname}!
			</div>

			{/* Maintainer Screens */}
			<a
				href="/dashboard/maintainer/orders"
				className="sm:max-w-sm block">
				<button className="flex items-center w-full text-base font-normal">
					<RegularCart className="inline-block w-12 h-12 mr-auto fill-gray-300"></RegularCart>
					<span>View {orderCount.count} Requests</span>
				</button>
			</a>
			<a href="/dashboard/maintainer/printers" className="w-96 block">
				<button className="flex items-center text-lg font-normal">
					<GenericPrinterIcon className="inline-block w-12 h-12 mr-auto fill-gray-100"></GenericPrinterIcon>
					<span>View Printers</span>
				</button>
			</a>
			<a
				href="/dashboard/maintainer/filaments"
				className="sm:max-w-sm block">
				<button className="flex items-center w-full text-base font-normal">
					<FilamentSpoolIcon className="inline-block w-12 h-12 mr-auto fill-gray-300"></FilamentSpoolIcon>
					<span>Manage Filament</span>
				</button>
			</a>

			{/* Admin Only Screens */}
			{(() => {
				if (permission != AccountPermission.Admin) {
					return null;
				}
				return (
					<div>
						<a
							href="/dashboard/maintainer/users"
							className="w-full sm:max-w-sm block">
							<button className="flex items-center w-full text-base font-normal">
								<RegularLicense className="inline-block w-12 h-12 mr-auto fill-gray-300"></RegularLicense>
								<span>Manage {userCount.count} Accounts</span>
							</button>
						</a>

						{/* <a
							href="/dashboard/maintainer/printers"
							className="w-full sm:max-w-sm block">
							<button className="flex items-center w-full text-base font-normal">
								<GenericPrinterIcon className="inline-block w-12 h-12 mr-auto fill-gray-300"></GenericPrinterIcon>
								<span>Manage Printers</span>
							</button>
						</a> */}
					</div>
				);
			})()}
		</>
	);
}