export interface User {
    email: string,
    name1: string,
    name2: string,
    permission: string
}

function UserRow({user}: {user: User}): JSX.Element {
  return (
    <tr>
      <td className="">{user.email}</td>
      <td className="">{user.name1}</td>
      <td className="">{user.name2}</td>
    </tr>
  )
}

export function UserList({users}: {users: User[]}): JSX.Element {
  return (
    <table className="bg-white m-auto border border-solid border-black border-collapse w-full">
      <thead>
        <tr>
          <th className="text-left">Email</th>
          <th className="text-left">First Name</th>
          <th className="text-left">Last Name</th>
        </tr>
      </thead>
      <tbody>
        {users.map((e) => <UserRow key={e.email} user={e} />)}
      </tbody>
    </table>
  )
}