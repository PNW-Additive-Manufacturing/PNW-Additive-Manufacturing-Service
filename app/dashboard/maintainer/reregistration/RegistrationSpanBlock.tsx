"use client";

import { formateDate } from "@/app/api/util/Constants";
import { confirmationForm, FloatingFormContext } from "@/app/components/FloatingForm";
import { RegistrationSpan, RegistrationSpanEntry } from "@/app/Types/RegistrationSpan/RegistrationSpan";
import { useCallback, useContext, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { actionDeleteRegistrationSpan, actionFetchRegistrationSpanEntries } from "./actions";
import useAPIFormState from "@/app/hooks/useAPIFormState";
import { useToggle } from "react-use";
import classNames from "classnames";
import { FaEye } from "react-icons/fa";
import FormLoadingSpinner from "@/app/components/FormLoadingSpinner";
import { RegularSpinnerSolid } from "lineicons-react";
import Spinner from "@/app/components/Spinner";
import { motion } from "motion/react";

export default function RegistrationSpanBlock({ span }: { span: RegistrationSpan }) {

    const { addForm } = useContext(FloatingFormContext);

    const [doShowEntries, toggleShowEntries] = useToggle(false);
    const [fetchedEntries, doFetchEntries, isFetchingEntries] = useAPIFormState(actionFetchRegistrationSpanEntries);

    const onTrashClick = useCallback(() => {

        addForm(confirmationForm({

            description: "Are you sure you would like to delete this span? All information will be removed.",
            async onSubmit() {
                const formData = new FormData();
                formData.set("spanId", span.id);

                const result = await actionDeleteRegistrationSpan(formData);
                return result.success ? null : result.errorMessage ?? "Unknown";
            }
        }));

    }, [span]);

    useEffect(() => {

        if (doShowEntries && (fetchedEntries === undefined || !fetchedEntries.success) && !isFetchingEntries) {

            const formData = new FormData();
            formData.set("spanId", span.id);

            doFetchEntries(formData);
        }

    }, [doShowEntries]);

    console.log(isFetchingEntries, fetchedEntries);

    return <>

        <div className="flex gap-6 justify-between items-center">

            <div>

                <p className="font-semibold">{span.name}</p>
                <p className="text-sm">
                    {formateDate(span.beginAt)} — {formateDate(span.endAt)}
                </p>

            </div>

            <div className="flex gap-4">

                <div className={classNames("button bg-pnw-gold-light p-3 rounded-lg")} onClick={toggleShowEntries}>

                    <div className="w-5 h-5">

                        {isFetchingEntries ? <Spinner /> : <FaEye className={"w-full h-full"} />}

                    </div>


                </div>

                <div className="button bg-pnw-gold-light p-3 rounded-lg" onClick={onTrashClick}>

                    <FaTrash className="w-5 h-5" />

                </div>

            </div>

        </div>

        <div className="flex flex-col gap-2">

            {fetchedEntries && !fetchedEntries.success && <>

                <hr className="mb-4" />

                <p className="text-warning text-sm">An issue occurred: {fetchedEntries.errorMessage}</p>

            </>}

            {(fetchedEntries && fetchedEntries.success && doShowEntries) && <>

                <hr className="mb-2" />

                <p className="text-sm">Accounts Reregistered</p>

                <ul>

                    {fetchedEntries.entries.map(e => <div>

                        <li key={e.accountEmail}>{e.firstName} {e.lastName} {e.yearOfStudy} {e.department}</li>

                    </div>)}

                </ul>

            </>}


        </div>

    </>
}