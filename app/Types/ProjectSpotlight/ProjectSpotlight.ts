export interface ProjectSpotlight
{
    id: string;
    title: string;
    author?: string;
    description: string;
    createdAt: Date;
    hasImage: boolean;
}

export interface ProjectSpotlightAttachment
{
    id: string;
    projectId: string;
    fileName: string;
    downloadCount: number;
}

export type ProjectSpotlightWithAttachments = ProjectSpotlight & { attachments: ProjectSpotlightAttachment[] };