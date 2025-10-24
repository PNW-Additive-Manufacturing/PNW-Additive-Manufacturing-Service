"use server";

import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBolt,
  faCartShopping,
  faIdBadge
} from "@fortawesome/free-solid-svg-icons";

import db from "@/app/api/Database";
import GenericPrinterIcon from "@/app/components/icons/GenericPrinterIcon";
import FilamentSpoolIcon from "@/app/components/icons/FilamentSpoolIcon";
import { AccountPermission } from "@/app/Types/Account/Account";
import getConfig from "@/app/getConfig";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { MdOutlineWavingHand } from "react-icons/md";

const envConfig = getConfig();

export default async function Maintainer() {
	let jwtPayload = await getJwtPayload();

	let permission: AccountPermission | null;
	try {
		permission = jwtPayload?.permission as AccountPermission;
	} catch {
		permission = null;
	}

	const orderCount = (await db`SELECT COUNT(*) FROM Request WHERE FulfilledAt IS NULL`)[0] as {
		count: number;
	};
	const userCount = (await db`select COUNT(*) from Account`)[0] as {
		count: number;
	};

	return (
		<HorizontalWrap>
			<section className="py-8">
				<h1 className="text-2xl tracking-wide font-light mb-8">
					Welcome, {jwtPayload?.firstname} {jwtPayload?.lastname}!
				</h1>

				<div className="lg:grid grid-cols-3 w-full">
					<div className="w-full col-span-2">
						{/* Maintainer Screens */}
						<a href="/dashboard/maintainer/orders" className="sm:max-w-sm block">
							<button className="flex items-center w-full text-base font-normal">
								<FontAwesomeIcon icon={faCartShopping} className="inline-block w-12 h-12 mr-auto fill-gray-300"/>
								<span>View {orderCount.count} Requests</span>
							</button>
						</a>
						<a href="/dashboard/maintainer/printers" className="sm:max-w-sm block">
							<button className="flex items-center w-full text-base font-normal">
								<GenericPrinterIcon className="inline-block w-12 h-12 mr-auto fill-gray-100"></GenericPrinterIcon>
								<span>View Printers</span>
							</button>
						</a>
						<a href="/dashboard/maintainer/filaments" className="sm:max-w-sm block">
							<button className="flex items-center w-full text-base font-normal">
								<FilamentSpoolIcon className="inline-block w-12 h-12 mr-auto fill-gray-300"></FilamentSpoolIcon>
								<span>Manage Filament</span>
							</button>
						</a>
						<a href="/dashboard/maintainer/quote" className="sm:max-w-sm block">
							<button className="flex items-center w-full text-base font-normal">
								<FontAwesomeIcon icon={faBolt} className="inline-block w-12 h-12 mr-auto fill-gray-300" />
								<span>Generate Quote</span>
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
											<FontAwesomeIcon icon={faIdBadge} className="inline-block w-12 h-12 mr-auto fill-gray-300"/>
											<span>Manage {userCount.count} Accounts</span>
										</button>
									</a>

									<a
										href="/dashboard/maintainer/accounting"
										className="w-full sm:max-w-sm block">
										<button className="flex items-center w-full text-base font-normal">
											<FaRegMoneyBillAlt className="inline-block w-12 h-12 mr-auto fill-gray-300" />
											<span>Accounting</span>
										</button>
									</a>

									<a
										href="/dashboard/maintainer/reregistration"
										className="w-full sm:max-w-sm block">
										<button className="flex items-center w-full text-base font-normal">
											<MdOutlineWavingHand className="inline-block w-12 h-12 mr-auto fill-gray-300" />
											<span>Reregistration</span>
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
					</div>
					{/* <div className="bg-white w-full col-span-1 shadow-sm rounded-md p-6">
					<h1 className="text-xl tracking-wide font-light mb-2">
						The Queue is Empty
					</h1>
					<div className="animate-pulse bg-background w-full p-6"></div>
				</div> */}
				</div>
			</section>
		</HorizontalWrap>
	);
}
