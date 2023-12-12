import { UserList, User, ListOfUserList } from '@/app/components/UserList'
import { getUsers } from '@/app/api/util/GetUsers';

export default async function Admin() {
    //grab initial lists of users and their permissions and place it into the ListOfUserList client component

    let resUser = await getUsers('user');
    let users: User[] = resUser.map((row: any) => {return {email: row.email, name1: row.firstname, name2: row.lastname, permission: row.permission}});

    let resMaintainer = await getUsers('maintainer') as any;
    let maintainers: User[] = resMaintainer.map((row: any) => {return {email: row.email, name1: row.firstname, name2: row.lastname, permission: row.permission}});

    let resAdmin = await getUsers('admin') as any;
    let admins: User[] = resAdmin.map((row: any) => {return {email: row.email, name1: row.firstname, name2: row.lastname, permission: row.permission}});

    return <div className='w-full xl:w-3/4 lg:mx-auto'>
        <ListOfUserList admins={admins} normUsers={users} maintainers={maintainers}/>
    </div>
}