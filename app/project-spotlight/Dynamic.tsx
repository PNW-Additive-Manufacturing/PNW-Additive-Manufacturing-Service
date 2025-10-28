import Link from "next/link";
import {AccountPermission} from "../Types/Account/Account";
import ProjectSpotlightServe from "../Types/ProjectSpotlight/ProjectSpotlightServe";
import {serveSession} from "../utils/SessionUtils";
import {CreateProject} from "./CreateProject";
import {ProjectCard} from "./ProjectCard";

export default async function Dynamic() {

    const session = await serveSession({requiredPermission: AccountPermission.Maintainer, unauthorizedBehavior: "logged-out"});

    const showcases = await ProjectSpotlightServe.queryAllProjectShowcases();
    await ProjectSpotlightServe.withManyAttachments(showcases);

    return <> 
		<div className="grid lg:grid-cols-2 2xl:grid-cols-4 gap-8 pb-8">

        	{showcases.map(s => (
            	<Link
                	key={s.id}
                	href={`/project-spotlight/${s.id}/`}
                	className="bg-background rounded-md block">
                	<ProjectCard style="normal" editable={true} projectData={s}/>
            	</Link>
        	))}

        	{session.isSignedIn && <CreateProject/>}

    	</div> 
	</>

}
