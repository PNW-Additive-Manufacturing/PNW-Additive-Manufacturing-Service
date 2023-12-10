"use server"

import { Input, InputBig } from '@/app/components/Input';
import { Navbar } from '@/app/components/Navigation'
import { RequestPartForm} from '@/app/components/RequestPartForm';
import { FilamentSelector } from '@/app/components/FilamentSelector';
import { getFilamentList } from '@/app/api/server-actions/request-part';
import Dropdown from '../components/Dropdown';
import { Filament } from '../dashboard/maintainer/filaments/FilamentTable';

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
        <main>
            <Navbar links={[
                {name: "User Dashboard", path: "/dashboard/user"},
                {name: "Logout", path: "/user/logout"}
            ]}/>

            <div className='w-full md:w-3/4 lg:w-3/5 bg-white h-screen mx-auto px-8 py-4'>
                <h1 className="w-full pb-4 text-center">Request a Print</h1>
                <RequestPartForm filaments={filaments as Filament[]}></RequestPartForm>
            </div>

            {/* <StlViewer
                style={style}
                orbitControls={true}
                shadows={true}
                showAxes={true}
                allowFullScreen={true}
                onFinishLoading={onFinishLoading}
                onError={onError}
                onErrorCapture={onError as any}
                url={url}
                modelProps={{

                }}
                floorProps={{
                    gridLength: 4,
                    gridWidth: 4
                }}
            /> */}
        </main>
    )
}