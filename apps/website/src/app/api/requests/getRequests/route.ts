import { getRequests } from "../../util/GetRequests"

export async function POST(request: Request) {
    let json = await request.json()
    let email = json.email as string
    let isFulfilled = json.isFullfilled as boolean
    let res = await getRequests(email, isFulfilled)
    return Response.json(res)
}