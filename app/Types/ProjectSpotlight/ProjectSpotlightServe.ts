// @ts-nocheck

import db from "@/app/api/Database";
import { ProjectSpotlight } from "./ProjectSpotlight";
import postgres from "postgres";
import DOMPurify from "isomorphic-dompurify";
import fs from "fs";
import { getProjectShowcaseImagePath } from "@/app/files";
import path from "path";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";

export default class ProjectSpotlightServe
{
    private static projectShowcaseFromSQL(row: postgres.Row): ProjectSpotlight
    {
        return {
            id: row.id,
            title: row.title,
            author: row.author,
            description: row.description,
            hasImage: row.hasimage,
            createdAt: row.createdat as Date
        };  
    }

    public static async queryAllProjectShowcases(): Promise<ProjectSpotlight[]>
    {
        const showcases = await db`SELECT * FROM ProjectSpotlight ORDER BY CreatedAt DESC`;

        return showcases.map<ProjectSpotlight>((s) => ProjectSpotlightServe.projectShowcaseFromSQL(s));
    }

    public static async queryProjectShowcase(title: string): Promise<ProjectSpotlight | null>
    {
        const showcase = await db`SELECT * FROM ProjectSpotlight WHERE title=${title}`;

        return showcase.length > 0 ? ProjectSpotlightServe.projectShowcaseFromSQL(showcase[0]) : null;
    }

    public static async insertProjectShowcase(data: Omit<ProjectSpotlight, "id" | "hasImage" | "createdAt">, image: File)
    {
        const purifiedTitle = DOMPurify.sanitize(data.title);
        const purifiedDescription = DOMPurify.sanitize(data.description);
        const purifiedAuthor = DOMPurify.sanitize(data.author!);

        await db.begin(async transaction => {

            const result = await transaction`INSERT INTO 
                ProjectSpotlight (Title, Description, Author, HasImage)
                VALUES (${purifiedTitle}, ${purifiedDescription}, ${purifiedAuthor}, ${image == null ? false : true})
                RETURNING Id`;

            const projectId = result.at(0)?.id as string;

            if (image != undefined)
            {
                const buffer = Buffer.from(await image.arrayBuffer());
    
                const imagePath = getProjectShowcaseImagePath(projectId);
    
                fs.mkdirSync(path.dirname(imagePath), {
                    recursive: true
                });

                fs.writeFileSync(imagePath, buffer as any);
            }
        });
    }

    public static async deleteProjectShowcase(projectId: string)
    {
        await db.begin(async transaction => {

            await transaction`DELETE FROM ProjectSpotlight WHERE Id=${projectId}`;
            
            const imagePath = getProjectShowcaseImagePath(projectId);
            fs.rmSync(imagePath);

        });
    }

    // We do not supporting changing the image at the moment.
    public static async editProjectShowcase(project: Omit<Partial<ProjectSpotlight>, "hasImage">)
    {
        await db.begin(async transaction => {

            const keys = (Object.entries(project)
                .filter((key, value) => value != undefined)
                .map(e => e[0]) as string[])
                .filter(k => k != "id");

            // console.log(keys, project);

            await transaction`UPDATE ProjectSpotlight SET ${transaction(project as any, keys)} WHERE Id=${project.id}`;
        });
    }
}