import AMSIcon from "./AMSIcon";
import DragInOnView from "./animation/DragOnView";

type AMFormProps = React.PropsWithChildren<{
    title: React.ReactElement | string,
    description?: React.ReactElement | string;
}>;

export default function AMForm({ children, title, description }: AMFormProps) {
    return <>

        <DragInOnView direction={"up"}>

            <div className="flex flex-col gap-4">

                <div className="w-fit lg:mx-auto">
                    <AMSIcon />
                </div>

                <h1 className="text-xl mx-auto font-normal w-fit">
                    {title}
                </h1>

                <hr className="m-3" />

                {description && <p className="text-sm">{description}</p>}

                <div className="flex flex-col gap-4">
                    {children}
                </div>

            </div>

        </DragInOnView>

    </>
}