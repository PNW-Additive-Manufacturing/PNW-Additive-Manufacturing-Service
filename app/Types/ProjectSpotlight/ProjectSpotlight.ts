export interface ProjectSpotlight
{
    id: string;
    title: string;
    author?: string;
    description: string;
    createdAt: Date;
    hasImage: boolean;
}

export interface ProjectSpotlightContent
{
    fileName: string;
    downloads: number;
}