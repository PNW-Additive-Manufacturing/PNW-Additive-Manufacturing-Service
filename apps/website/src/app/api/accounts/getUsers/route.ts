import { getUsers } from "../../util/GetUsers"

export async function POST(request: Request) {
    let json = await request.json()
    let permission = json.permission as string
    let res = await getUsers(permission)
    return Response.json(res)
}