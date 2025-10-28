import{ Suspense } from "react";
import HorizontalWrap from "@/app/components/HorizontalWrap";
import { ProjectDetail } from "./ProjectDetails";

interface PageProps {
    params: Promise<{ id: string }>;
}



export default function Page({ params }: PageProps) {
    return (
        <>
            <HorizontalWrap className="py-8">
                <a href="/project-spotlight/" className="text-blue-600 hover:underline mb-4 inline-block">
                    ← Back to Project Spotlight
                </a>
            </HorizontalWrap>
            
            <div className="bg-white min-h-screen">
                <HorizontalWrap className="py-8">
                    <Suspense fallback={<div className="text-center py-8">Loading project...</div>}>
                        <ProjectDetail paramsPromise={params} />
                    </Suspense>
                </HorizontalWrap>
            </div>
        </>
    );
}
