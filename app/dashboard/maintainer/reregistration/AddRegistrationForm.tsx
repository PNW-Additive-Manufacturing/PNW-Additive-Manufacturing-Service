"use client"

import { FloatingFormContext } from "@/app/components/FloatingForm";
import { useCallback, useContext } from "react";
import { actionAddRegistrationSpan } from "./actions";

export default function AddRegistrationSpanForm() {
    const { addForm } = useContext(FloatingFormContext);

    const onClick = useCallback(() => {

        addForm({

            title: "Add Registration Span",
            description: "Adding a registration span will require users to update certain account information during the provided timeframe.",
            questions: [
                {
                    type: "text",
                    id: "name",
                    name: "Name",
                    placeholder: "Fall of ...",
                    required: true
                },
                {
                    type: "date",
                    id: "beginAt",
                    name: "Begin At",
                    required: true
                },
                {
                    type: "date",
                    id: "endAt",
                    name: "End At",
                    required: true
                }
            ],
            async onSubmit(data) {

                const result = await actionAddRegistrationSpan(data);

                return result.success ? null : result.errorMessage ?? "Unknown";

            },

        });

    }, []);

    return <>

        <div className="bg-background p-4 rounded-md shadow-sm button" onClick={onClick}>

            <p>Add Registration Span</p>

        </div>

    </>
}