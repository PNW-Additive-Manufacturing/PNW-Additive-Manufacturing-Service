import { notFound } from "next/navigation";
import { use } from "react";
import { ProjectCard } from "@/app/project-spotlight/ProjectCard";
import ProjectSpotlightServe from "@/app/Types/ProjectSpotlight/ProjectSpotlightServe";




export async function ProjectDetail({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
    const { id: projectId } = await paramsPromise;
    

    // Fetch the project by ID
    const project = await ProjectSpotlightServe.queryProjectShowcaseById(projectId);

    // If project not found, show 404
    if (!project) {
        notFound();
    }

    // Fetch attachments
    await ProjectSpotlightServe.withAttachments(project);

    return (
        <div className="max-w-4xl mx-auto">
            <ProjectCard 
                style="normal" 
                editable={false} 
                projectData={project} 
            />
        </div>
    );
}
