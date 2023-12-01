import { Navbar } from '@/app/components/Navigation'

import db from '@/app/api/Database';

// Client Component to test communication with NextJS routes and API
export default async function TestNextAPI() {

  const dbMessage = await db`select * from account`;

  return (
    <main>      
      <Navbar links={[
        {name: "Request a Print", path: "/request-part"},
        {name: "Test NextJS API", path: "/test-next-api"},
      ]}/>
      <p>Database Test Server Component: </p>
      <p>{JSON.stringify(dbMessage)}</p>
    </main>
  )
}
