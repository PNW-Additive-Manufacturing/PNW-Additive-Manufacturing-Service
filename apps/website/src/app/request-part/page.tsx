"use server"

import { Input } from '@/app/components/Input';
import { InputBig } from '@/app/components/InputBig';
import { Navbar } from '@/app/components/Navigation'
import { RequestPartForm } from '@/app/components/RequestPartForm';
import { FilamentSelector } from '@/app/components/FilamentSelector';

import { getFilamentList } from '@/app/api/server-actions/request-part';

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

            <RequestPartForm>
                <h1 className="w-full pb-4 text-left">Request a Print</h1>

                <Input label="Request Name" type="text" id="name" name="requestname" placeholder="Enter the name of the request"/>

                <div className="font-semibold">
                    <p className="uppercase br-2">{"STL Part File"}</p>
                    <input type="file" id="model" accept=".stl" name="file" multiple={true}/>
                </div>

                <div className="pt-3 pb-4">
                    <p className="uppercase font-semibold br-2">{"Filament"}</p>
                    <FilamentSelector filaments={filaments}/>
                </div>

                <InputBig label="Notes" id="notes" name="notes" placeholder="Anything else we should know?"/>
                
            </RequestPartForm>
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