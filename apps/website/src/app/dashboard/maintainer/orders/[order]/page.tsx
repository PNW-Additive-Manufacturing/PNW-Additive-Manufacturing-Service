'use server'

import db from "@/app/api/Database";
import { redirect } from "next/navigation";
import DropdownSection from '../../../../components/DropdownSection';
import { RequestsTable, RequestPartsOnlyTable } from "../Tables";


export default async function OrderMaintainer({ params } : { params: any }) {
    return <> {(async () => {
        if (params.order == null || Number.isNaN(Number(params.order))) {
            return redirect("/dashboard/maintainer/orders");
        }
        const orderId = Number(params.order);
        const requests = await db`select * from request order by submittime asc`;
        const quiredOrder = requests.find(r => r.id == orderId);
        if (quiredOrder == null) return redirect("/dashboard/maintainer/orders");
        
        return <>
            <DropdownSection name='Active Requests' className="mt-4" hidden={quiredOrder.isfulfilled}>
                <RequestsTable isFulfilled={false} quiredOrder={quiredOrder}></RequestsTable>
            </DropdownSection>

            <DropdownSection name='Completed Requests' className="mt-8" hidden={!quiredOrder.isfulfilled}>
                <RequestsTable isFulfilled={true} quiredOrder={quiredOrder}></RequestsTable>
            </DropdownSection>

            <DropdownSection name={`Parts for ${quiredOrder.name}`} className='mt-8'>
                <RequestPartsOnlyTable request={quiredOrder.id}></RequestPartsOnlyTable>
            </DropdownSection>
        </>
    })()} </>
}