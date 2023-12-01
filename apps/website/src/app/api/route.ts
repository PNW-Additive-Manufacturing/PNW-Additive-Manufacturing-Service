
//route.ts is similar to page.tsx, except route.ts will return pure data instead of UI components
//and web pages.
//route.ts and page.tsx CANNOT go in the same folder.
//Use route.ts for NextJS API endpoints, use page.tsx for NextJS web pages and UI.
export function GET(request: Request) {
  return Response.json({message: "Testing NextJS Server-Side API from Client-Side React components!"});
}