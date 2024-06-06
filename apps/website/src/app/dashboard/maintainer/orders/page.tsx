'use client'

import { setPartState } from '@/app/api/server-actions/maintainer';
import { Part, Request } from '@/app/api/util/Constants';
import { CurrencyInput, DownloadButton, GenericUnitInput } from '@/app/components/Inputs';
import Table from '@/app/components/Table';
import { Dialog } from '@headlessui/react';
import { RegularEmptyFile, RegularPackage, RegularSpinnerSolid } from 'lineicons-react';
import { createRef, forwardRef, useDebugValue, useEffect, useState } from 'react';

function OrderPopup({ order, onClose }: { order: Request, onClose: () => void }) {

    let [isLoadingParts, setLoadingParts] = useState(true);
    let [parts, setParts] = useState<Part[]>([]);

    let [price, setPrice] = useState<number>(0);
    

    function QuoteElement(): JSX.Element {
        return <> 
        <div className='mb-2'>
            <h2 className='inline text-3xl tracking-wide font-light mb-1'>Quote #{order.id}</h2>
        </div>

        <div className='w-3/4'>
            <p className="font-semibold p-2 pl-0">Customer Information</p>
            <p>Submitted by {order.firstname} {order.lastname} at {order.submittime}.</p>
        </div>

        <div className='grid grid-cols-3 grid-rows-2 gap-6'>
            <div className='col-start-1 row-start-1'>
                <p className="font-semibold p-2 pl-0">Pricing</p>
                <CurrencyInput id="price" defaultValue={price} onChange={(v) => setPrice(v)}></CurrencyInput>

                <GenericUnitInput id="generated-price" unit="Grams" placeHolder="Calculate" onChange={v =>
                {

                    // https://www.desmos.com/calculator/8e8fju2sul 

                    if (isNaN(v)) return;

                    let price: number = Math.ceil(0.025 * v);

                    setPrice(price);

                    console.log(price);

                }}></GenericUnitInput>

            </div>

            <div className='col-start-1 row-start-2 flex flex-row gap-2 content-end'>
                <button className="m-0 h-fit" onClick={() => {
                    let data = new FormData();
                    console.log(parts);
                    data.append("part_id", parts[0].partid.toString());
                    data.append("state", "queued");

                    setPartState("", data)
                        .then((v) => console.log("Finished: " + v))
                        .then(onClose);

                }}>Accept</button>
                <button className="bg-red-800 m-0 h-fit">Decline</button>
            </div>

            <div className='col-start-2 col-span-2 row-start-1 row-span-2'>
                <p className="font-semibold p-2 pl-0">Parts</p>
                <div className='bg-background rounded-sm' style={{ minHeight: "20rem" }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Model Name</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Filament</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map(part =>
                                <tr id={`${part.partid}`}>
                                    <td>
                                        {part.modelname}
                                    </td>
                                    <td>{part.quantity}</td>
                                    <td>{part.status}</td>
                                    <td>{part.filamentmaterial + " " + part.filamentcolor}</td>
                                </tr>)}
                        </tbody>
                    </Table>
                    {isLoadingParts ? <div className='w-full p-10'>
                        <div className='w-fit mx-auto'>
                            Fetching Parts
                            <RegularSpinnerSolid className='inline ml-4 animate-spin fill-black w-8 h-8'></RegularSpinnerSolid>
                        </div>
                    </div> : <></>}
                </div>
            </div>
        </div>
        </>
    }

    useEffect(() => {
        if (!isLoadingParts) return;

        fetch(`/api/parts?order=${order.id}`)
            .then((res) => res.json() as Promise<Part[]>)
            .then((data) => {
                if (Object.hasOwn(data, "error")) 
                {
                    console.log("SOMETHING WENT WRONG!");
                }
                else 
                {
                    setParts(data);
                    setLoadingParts(false);
                }
            });
    })

    return <Dialog open={true} onClose={onClose} className="relative z-50">

        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex w-screen items-center justify-center shadow-lg">
            <Dialog.Panel className="w-fit rounded-md bg-white p-6">

                {/* <Dialog.Title className="mb-4 col-start-1 row-start-1">
                    Quote
                    <br />
                    {order?.name}
                </Dialog.Title> */}

                {/* Waiting for Approval Layout */}
                <QuoteElement></QuoteElement>


            </Dialog.Panel>
        </div>
    </Dialog>
}

export default function Maintainer({ params }: { params: any }) {
    let [currentFilter, setFilter] = useState<String>("pending");
    let [orders, setOrders] = useState<Request[]>([]);
    let [isLoading, setLoading] = useState(true);

    let [inspectOrder, setInspectOrder] = useState<Request>();

    useEffect(() => {
        if (!isLoading) return;

        fetch(currentFilter == "any" ? "/api/orders" : currentFilter == "fulfilled" ? "/api/orders?fulfilled" : currentFilter == "Ready for Pickup" ? "/api/orders/readyforpickup" : "/api/orders?onlyWithPartStatus=" + currentFilter)
            .then((res) => res.json() as Promise<Request[]>)
            .then((data) => {
                setOrders(data);
                setLoading(false)
            });
    })

    return <>
        {/* Order Information Popup */}
        {inspectOrder ? <OrderPopup order={inspectOrder} onClose={() => setInspectOrder(undefined)}></OrderPopup> : <></>}


        <h1 className='text-3xl tracking-wide font-light my-4'>Manage Orders</h1>
        <div className='bg-white rounded-sm w-full grid grid-cols-4 p-6 gap-6 mb-14'>
            <div className='col-start-1 col-span-1'>
                <h2 className='text-xl tracking-wide font-light my-4'>Filters</h2>

                <div className={`${currentFilter == 'any' ? 'bg-emerald-600/30' : ''} py-3 px-4 rounded-lg my-2 hover:cursor-pointer`} onClick={() => { setFilter("any"); setLoading(true); }}>
                    <div className='inline-block w-3 h-3 rounded-full mr-2 bg-emerald-600'></div>
                    <span>Any</span>
                </div>
                <div className={`${currentFilter == 'Ready for Pickup' ? 'bg-purple-800/30' : ''} py-3 px-4 rounded-lg my-2 hover:cursor-pointer`} onClick={() => { setFilter("Ready for Pickup"); setLoading(true); }}>
                    <div className='inline-block w-3 h-3 rounded-full mr-2 bg-purple-800'></div>
                    <span>Ready for Pickup</span>
                </div>
                <div className={`${currentFilter == 'Printing' ? 'bg-blue-600/30' : ''} py-3 px-4 rounded-lg my-2 hover:cursor-pointer`} onClick={() => { setFilter("Printing"); setLoading(true); }}>
                    <div className='inline-block w-3 h-3 rounded-full mr-2 bg-blue-600'></div>
                    <span>Being Worked On?</span>
                </div>
                <div className={`${currentFilter == 'pending' ? 'bg-gray-500/30' : ''} py-3 px-4 rounded-lg my-2 hover:cursor-pointer`} onClick={() => { setFilter("pending"); setLoading(true); }}>
                    <div className='inline-block w-3 h-3 rounded-full mr-2 bg-gray-500'></div>
                    <span>Waiting for Quote</span>
                </div>
                <div className={`${currentFilter == 'fulfilled' ? 'bg-green-600/30' : ''} py-3 px-4 rounded-lg my-2 hover:cursor-pointer`} onClick={() => { setFilter("fulfilled"); setLoading(true) }}>
                    <div className='inline-block w-3 h-3 rounded-full mr-2 bg-green-600'></div>
                    <span>Fulfilled</span>
                </div>
            </div>
            <div className='col-start-2 col-span-3'>
                <h2 className='text-xl tracking-wide font-light my-4'>Orders</h2>

                <Table className='bg-background rounded-sm'>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Name</th>
                            <th>Account</th>
                            <th>Parts</th>
                            <th>Submitted At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? <></> : orders.map((order) => {
                            console.log(order);
                            return <tr onClick={() => setInspectOrder(order)}>
                                <td>{order.id}</td>
                                <td>{order.name}</td>
                                <td>{order.firstname} {order.lastname}</td>
                                <td>{order.numberofparts}</td>
                                <td>{order.submittime?.toString()}</td>
                            </tr>
                        })}
                    </tbody>
                </Table>
                {isLoading ? <div className='w-full p-10 bg-background'>
                    <div className='w-fit mx-auto'>
                        Fetching Orders
                        <RegularSpinnerSolid className='inline ml-4 animate-spin fill-black w-8 h-8'></RegularSpinnerSolid>
                    </div>
                </div> : <></>}
            </div>
        </div>
    </>
}
