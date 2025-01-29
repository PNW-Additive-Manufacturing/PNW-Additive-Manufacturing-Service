

// export const FloatingPanelContext = createContext<{
//     forms: FloatingForm[];
//     addForm: (form: FloatingForm) => void;
// }>(undefined!);

// /**
//  * Manages the queue of forms and renders the active one.
//  */
// export const FloatingFormContainer: React.FC<React.PropsWithChildren> = ({
//     children,
// }) => {
//     const [forms, setForms] = useState<FloatingForm[]>([]);
//     const [submissionError, setSubmissionError] = useState<string>();

//     const activeForm = useMemo(() => forms.at(forms.length - 1), [forms]);

//     const addForm = useCallback((form: FloatingForm) => {
//         setForms((prev) => [...prev, form]);
//     }, []);

//     const removeActiveForm = useCallback(() => {
//         setForms((prev) => prev.slice(1));
//         setSubmissionError(undefined);
//     }, []);

//     return (
//         <FloatingFormContext.Provider value={{ forms: [], addForm }}>
//             {activeForm && (
//                 <div className="fixed md:absolute max-md:bottom-0 md:top-0 left-0 w-screen h-screen md:flex items-center justify-center z-10 bg-black bg-opacity-30">
//                     <div className="bg-white max-md:fixed bottom-0 p-4 lg:p-6 w-full md:w-fit lg:w-1/4 md:rounded-md md:shadow-md">
//                         <FloatingForm
//                             submissionError={submissionError}
//                             form={activeForm}
//                             onClose={async (submitted, data) => {
//                                 if (submitted) {
//                                     const error = await activeForm.onSubmit(data!);
//                                     const hasError = error != null;

//                                     if (hasError) {
//                                         // toast.error("Form incomplete: " + error);
//                                         setSubmissionError(error);
//                                     }
//                                     else removeActiveForm();
//                                 }
//                                 else {
//                                     if (activeForm.onCancel != null) activeForm.onCancel();
//                                     removeActiveForm();
//                                 }
//                             }}
//                         />
//                     </div>
//                 </div>
//             )}
//             {children}
//         </FloatingFormContext.Provider>
//     );
// };
