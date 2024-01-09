import db from "@/app/api/Database";
import DropdownSection from '../../../components/DropdownSection';
import { ActiveRequestsTable, CompletedRequestsTable, RunningPartsTable, QueuedPartsTable, PendingReviewPartsTable } from "./Tables";

export default async function Maintainer({ params }: { params: any }) {
    const activeRequests = await db`select * from request where isfulfilled='false' order by submittime asc`;
    const completedRequests = await db`select * from request where isfulfilled='true' order by submittime asc`;
    const parts = await db`select * from part order by id asc;`;

    return <>
        <DropdownSection className="mt-4" name='Active Requests'>
            <ActiveRequestsTable></ActiveRequestsTable>
        </DropdownSection>

        <DropdownSection className="mt-4" name='Completed Requests' hidden={true}>
            <CompletedRequestsTable></CompletedRequestsTable>
        </DropdownSection>

        <DropdownSection name='Active Parts' className='mt-8'>
            <RunningPartsTable></RunningPartsTable>
        </DropdownSection>

        <DropdownSection name='Queued Parts' className='mt-8'>
            <QueuedPartsTable></QueuedPartsTable>
        </DropdownSection>

        <DropdownSection name='Pending Parts' className='mt-8'>
            <PendingReviewPartsTable></PendingReviewPartsTable>
        </DropdownSection>
    </>
}