import { AccountPermission } from '@/app/Types/Account/Account';
import { serveRequiredSession } from '@/app/utils/SessionUtils';
import checkDiskSpace from 'check-disk-space';
import { Suspense } from 'react';

export default async function MaintainerLayout({ children }: { children: React.ReactNode; }) {
	
	// Popup any site-critical issues on every page of the maintainer dashboard.
	// This could include low-storage, or domain expiration status? We shall see.

	return <>

		<Suspense>

			<StorageDetails />

		</Suspense>

		{children}

	</>;
}

async function StorageDetails() {

	// Auth Check
	await serveRequiredSession({ requiredPermission: AccountPermission.Maintainer });

	const remainingStorage = Math.round((await checkDiskSpace(process.cwd())).free / 1000000000);
	const isLowOnStorage = remainingStorage < 50;

	return <>

		{isLowOnStorage &&
			<div className="mb-6 rounded-md border-dashed border-2 border-red-500 w-full h-full bg-red-100 p-2 lg:p-6">
				{<p>Available storage is under 50 GB ({remainingStorage} GB remaining). Attempt to purge stale models or expand volume.</p>}
			</div>
		}

	</>
}