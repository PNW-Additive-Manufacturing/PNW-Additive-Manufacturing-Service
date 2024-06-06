"use server"

import { RequestPartForm} from '@/app/components/RequestPartForm';
import { getFilamentList } from '@/app/api/server-actions/request-part';
import { Filament } from '../dashboard/maintainer/filaments/FilamentTable';
import HorizontalWrap from '../components/HorizontalWrap';

/*
    This MUST be a server component to work because the FilamentSelector is a client side component
    that needs the filement list from a Server Action, which can only be retrieved 
    asyncronously when using a Server Component.

    Client Components cannot render Server Components unless the server component is passed as a prop.

    Note that Client Components CANNOT render async Server Components, even if the async Server
    Component is passed as a prop.
*/

export default async function Request() {
    let filaments = await getFilamentList();

    return (
        <HorizontalWrap>
            <h1 className='text-3xl tracking-wide font-light my-4'>Fill out a Request</h1>
            <p className='mb-4'>Utilizing our resources for rapid prototyping to final designs, we use top-notch consumer 3D Printers to ensure an outstanding result of your models.</p>
            <RequestPartForm filaments={filaments as Filament[]}></RequestPartForm>
        </HorizontalWrap>
    )
}