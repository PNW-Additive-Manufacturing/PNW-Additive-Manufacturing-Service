import DropdownSection from '../../../components/DropdownSection';
import { ActiveRequestsTable, CompletedRequestsTable, RunningPartsTable, QueuedPartsTable, PendingReviewPartsTable } from "./Tables";

export default async function Maintainer({ params }: { params: any }) {
    return <>
        <DropdownSection name='Active Requests' className="mt-4">
            <ActiveRequestsTable></ActiveRequestsTable>
        </DropdownSection>

        <DropdownSection name='Completed Requests' className="mt-8" hidden={true}>
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