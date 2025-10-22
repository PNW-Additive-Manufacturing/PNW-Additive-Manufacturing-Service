"use client";

import classNames from "classnames";
import { createContext, useCallback, useMemo, useState, useTransition } from "react";

interface FloatingFormQuestionBase {
    name: string;
    required: boolean;
};

interface FloatingFormQuestionInput extends FloatingFormQuestionBase {
    id: string;
    type: string;
    placeholder?: string;
    defaultValue?: string
}

interface FloatingFormQuestionSelector extends FloatingFormQuestionBase {
    id: string;
    options: Record<string, string>,
    defaultOptionValue?: string
}

interface FloatingFormCustomQuestion extends FloatingFormQuestionBase {
    element: React.ReactElement<{ required: boolean }>
}

export type FloatingFormQuestion = FloatingFormQuestionInput | FloatingFormQuestionSelector | FloatingFormCustomQuestion;

export interface FloatingForm {
    /**
     * Invoked when the form is submitted by the user. The return value controls the flow of the form.
     * @param data Data provided from the user when submitting the form.
     * @returns String when an issue occurred or null when the prompt should be closed.
     */
    onSubmit: (data: FormData) => Promise<string | null>;
    onCancel?: () => void;
    icon?: React.ReactElement;
    title: React.ReactElement | string;
    description?: string;
    submitName?: string;
    cancelName?: string;
    submitClassnames?: string;
    cancelClassnames?: string;
    questions: FloatingFormQuestion[];
}

export const FloatingFormContext = createContext<{
    forms: FloatingForm[];
    addForm: (form: FloatingForm) => void;
}>(undefined!);

/**
 * Manages the queue of forms and renders the active one.
 */
export const FloatingFormContainer: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [forms, setForms] = useState<FloatingForm[]>([]);
    const [submissionError, setSubmissionError] = useState<string>();

    const activeForm = useMemo(() => forms.at(forms.length - 1), [forms]);

    const addForm = useCallback((form: FloatingForm) => {
        setForms((prev) => [...prev, form]);
    }, []);

    const removeActiveForm = useCallback(() => {
        setForms((prev) => prev.slice(1));
        setSubmissionError(undefined);
    }, []);

    return (
        <FloatingFormContext.Provider value={{ forms: [], addForm }}>
            {activeForm && (
                <div className="fixed max-md:bottom-0 md:top-0 left-0 w-screen h-screen md:flex items-center justify-center z-20 bg-black bg-opacity-30">
                    <div className="bg-white max-md:fixed bottom-0 p-4 lg:p-6 w-full md:w-fit lg:w-1/4 md:rounded-md md:shadow-md">
                        <FloatingForm
                            submissionError={submissionError}
                            form={activeForm}
                            onClose={async (submitted, data) => {
                                if (submitted) {
                                    const error = await activeForm.onSubmit(data!);
                                    const hasError = error != null;

                                    if (hasError) {
                                        // toast.error("Form incomplete: " + error);
                                        setSubmissionError(error);
                                    }
                                    else removeActiveForm();
                                }
                                else {
                                    if (activeForm.onCancel != null) activeForm.onCancel();
                                    removeActiveForm();
                                }
                            }}
                        />
                    </div>
                </div>
            )}
            {children}
        </FloatingFormContext.Provider>
    );
};

function FloatingForm({ form, onClose, submissionError }: { form: FloatingForm, onClose: (submitted: boolean, data?: FormData) => void; submissionError?: string }) {

    const [isSubmitPending, startSubmit] = useTransition();

    return <form action={(data) => startSubmit(async () => await onClose(true, data))}>
        <div className="flex items-center gap-1 mb-2">
            {form.icon}
            <h2 className="text-xl font-thin">
                {form.title}
            </h2>
        </div>
        {form.description && <p className="font-light text-sm">{form.description}</p>}

        {form.questions.length > 0 ? <hr className="mb-4" /> : <br />}

        <div className="flex flex-col gap-6">
            {form.questions.map(q => <div key={q.name}>
                <FloatingFormQuestion question={q} />
            </div>)}
        </div>

        <div>
            {submissionError && <div className="p-3 bg-red-100 rounded-md text-sm mb-4">
                <p>An issue occurred submitting this form.</p>
                <p className="text-xs">{submissionError}</p>
            </div>}
            <div className="flex max-md:flex-col gap-4">
                <button type="button" className={classNames("mb-0 bg-background out text-black text-left text-sm", form.cancelClassnames)} onClick={() => onClose(false)}>{form.cancelName ?? "Cancel"}</button>
                <button type="submit" disabled={isSubmitPending} className={classNames("mb-0 text-left text-sm", form.submitClassnames, { "animate-pulse": isSubmitPending })}>{form.submitName ?? "Submit"}</button>
            </div>
        </div>

    </form>
}

function FloatingFormQuestion({ question }: { question: FloatingFormQuestion }) {
    return <>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className={classNames("", { "inline": (question as Partial<FloatingFormQuestionInput>).type == "radio" })}>
            {question.required && <span className="text-red-300">* </span>}
            {question.name}
        </label>
        {(question as any).options != null
            ? <FloatingFormQuestionSelector selector={question as any as FloatingFormQuestionSelector} />
            : (question as FloatingFormCustomQuestion).element != null
                ? (question as FloatingFormCustomQuestion).element
                : <FloatingFormQuestionInput input={question as any as FloatingFormQuestionInput} />}
    </>
}

function FloatingFormQuestionInput({ input }: { input: FloatingFormQuestionInput }) {
    return input.type == "textarea"
        ? <textarea className="min-h-24 shadow-sm md:text-sm w-full" {...input} defaultValue={input.defaultValue} name={input.id} />
        : <input {...input} name={input.id} defaultValue={input.defaultValue} className={classNames("shadow-sm text-sm w-full", { "inline": input.type == "radio" })} />
}

function FloatingFormQuestionSelector({ selector }: { selector: FloatingFormQuestionSelector }) {
    return <>
        <select className="text-sm" required={selector.required} defaultValue={selector.defaultOptionValue} title={selector.name} name={selector.id} id={selector.id}>
            {Object.entries(selector.options).map(entry => <option key={entry[0]} value={entry[0]}>{entry[1]}</option>)}
        </select>
    </>
}

// -- Floating Form Factory --
export function confirmationForm(overrides: Partial<Omit<FloatingForm, "onCancel" | "onSubmit">> & Pick<FloatingForm, "onCancel" | "onSubmit">): FloatingForm {
    return {
        title: <>{overrides.title ?? "Are you sure you want to continue?"}</>,
        description: overrides.description,
        submitName: overrides.submitName ?? "Continue",
        cancelName: overrides.cancelName,
        onSubmit: overrides.onSubmit,
        onCancel: overrides.onCancel,
        submitClassnames: "bg-red-500 hover:bg-red-600",
        questions: overrides.questions ?? []
    }
}