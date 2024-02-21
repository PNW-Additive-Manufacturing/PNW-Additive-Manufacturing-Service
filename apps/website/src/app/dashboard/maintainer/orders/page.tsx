import DropdownSection from '../../../components/DropdownSection';
import { RequestsTable, RunningPartsTable, QueuedPartsTable, PendingReviewPartsTable } from "./TablesClient";
import { PendingReviewPartsTableServer, QueuedPartsTableServer, RequestsTableServer, RunningPartsTableServer } from './TablesServer';

export default async function Maintainer({ params }: { params: any }) {
    return <>
        <DropdownSection name='Active Requests' className="mt-4">
            <RequestsTableServer isFulfilled={false}></RequestsTableServer>
        </DropdownSection>

        <DropdownSection name='Completed Requests' className="mt-8" hidden={true}>
            <RequestsTableServer isFulfilled={true}></RequestsTableServer>
        </DropdownSection>

        <DropdownSection name='Active Parts' className='mt-8'>
            <RunningPartsTableServer></RunningPartsTableServer>
        </DropdownSection>

        <DropdownSection name='Queued Parts' className='mt-8'>
            <QueuedPartsTableServer></QueuedPartsTableServer>
        </DropdownSection>

        <DropdownSection name='Pending Parts' className='mt-8'>
            <PendingReviewPartsTableServer></PendingReviewPartsTableServer>
        </DropdownSection>
    </>
}