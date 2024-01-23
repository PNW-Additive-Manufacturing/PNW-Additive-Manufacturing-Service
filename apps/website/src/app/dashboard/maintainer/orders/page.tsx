import DropdownSection from '../../../components/DropdownSection';
import { RequestsTable, RunningPartsTable, QueuedPartsTable, PendingReviewPartsTable } from "./Tables";

export default async function Maintainer({ params }: { params: any }) {
    return <>
        <DropdownSection name='Active Requests' className="mt-4">
            <RequestsTable isFulfilled={false}></RequestsTable>
        </DropdownSection>

        <DropdownSection name='Completed Requests' className="mt-8" hidden={true}>
            <RequestsTable isFulfilled={true}></RequestsTable>
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