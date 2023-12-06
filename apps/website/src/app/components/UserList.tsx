export interface User {
    email: string,
    name1: string,
    name2: string,
    permission: string
}

function UserRow({user}: {user: User}): JSX.Element {
  return (
    <tr className="">
      <td className="">{user.email}</td>
      <td className="">{user.name1}</td>
      <td className="">{user.name2}</td>
      <td className="">
        <select id="permission" name="User Type" className="rounded-md m-0 inline-block text-black bg-transparent border-gray-700 border">
          <option value="none" selected disabled hidden>User Type</option>
          <option value="admin">Administrator</option>
          <option value="maintainer">Maintainer</option>
          <option value="user">Normal User</option>
        </select>
        <button className="text-nm font-normal p-0 pr-1 pl-1 m-0 ml-1 mr-1 rounded-md inline-block text-black bg-transparent border-gray-700 border">Change Permissions</button>
      </td>
    </tr>
  )
}

export function UserList({users}: {users: User[]}): JSX.Element {
  return (
    <table className="bg-white m-auto w-full">
      <thead>
        <tr className="text-gray-400">
          <th className="text-left">Email</th>
          <th className="text-left">First Name</th>
          <th className="text-left">Last Name</th>
          <th className="text-left">Manage User</th>
        </tr>
      </thead>
      <tbody>
        {users.map((e) => <UserRow key={e.email} user={e} />)}
      </tbody>
    </table>
  )
}