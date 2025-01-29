import classNames from "classnames";

export function LabelWithIcon({ children, icon, classname }: React.PropsWithChildren<{ icon: React.ReactElement; classname?: string }>) {
    return <label className={classNames("w-fit", classname)}>
        <span className="[&>*]:inline [&>*]:mb-1 inline mr-1">{icon}</span>
        {children}
    </label>;
}
