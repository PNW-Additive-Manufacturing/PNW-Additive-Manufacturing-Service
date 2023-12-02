import { UserList, User } from '@/app/components/UserList'
import { Navbar } from '@/app/components/Navigation'
import { getUsers } from '@/app/api/util/GetUsers';

export default async function Admin() {

    let resUser = await getUsers('user');
    let users: User[] = resUser.map((row: any) => {return {email: row.email, name1: row.firstname, name2: row.lastname, permission: row.permission}});
    //console.log(resUser);

    let resMaintainer = await getUsers('maintainer') as any;
    let maintainers: User[] = resMaintainer.map((row: any) => {return {email: row.email, name1: row.firstname, name2: row.lastname, permission: row.permission}});
    //console.log(resMaintainer);

    let resAdmin = await getUsers('admin') as any;
    let admins: User[] = resAdmin.map((row: any) => {return {email: row.email, name1: row.firstname, name2: row.lastname, permission: row.permission}});
    //console.log(resAdmin);

    return (
        <main>
            <Navbar links={[
                {name: "Request a Print", path: "/request-part"},
                {name: "User Dashboard", path: "/dashboard/user"},
                {name: "Maintainer Dashboard", path: "/dashboard/maintainer"},
                {name: "Logout", path: "/logout"}
            ]}/>

            <div className="bg-white rounded-sm p-14 w-full left">
                <h1 className="w-full pb-4 pt-10 text-left">Admin List</h1>
                <UserList users={admins}/>

                <h1 className="w-full pb-4 pt-10 text-left">Maintainer List</h1>
                <UserList users={maintainers}/>

                <h1 className="w-full pb-4 pt-10 text-left">User List</h1>
                <UserList users={users}/>

            </div>
        </main>
    );
}