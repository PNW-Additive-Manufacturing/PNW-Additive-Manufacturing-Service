import classNames from "classnames";
import { useContext } from "react";
import { FloatingFormContext } from "./FloatingForm";
import { RegularPencil } from "lineicons-react";

type FigureProps = {
    name: string,
    amount: any,
    style: "small" | "large" | "inline",
    prefix?: React.ReactElement | string,
    icon?: JSX.Element,
    iconPosition?: "start" | "end",
    labelClassName?: string,
    useColors?: boolean
    flipColors?: boolean;
};

export function Figure({ name, amount, prefix, style, icon, iconPosition, labelClassName, useColors, flipColors }: FigureProps) {

    useColors ??= false;
    flipColors ??= false;
    iconPosition ??= "end";

    const fontStyle = classNames({
        "font-light": style === "small",
        "font-semibold": style === "large"
    });

    return <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className={classNames("mb-0.5", { "inline font-light ": style === "inline" }, labelClassName)}>
            {icon && iconPosition === "start" && <span className="mr-1 [&>*]:inline">{icon}</span>}
            {name}
        </label>
        <p className={classNames(fontStyle, "text-nowrap", { "inline ": style === "inline", "text-warning": useColors && (flipColors ? amount > 0 : amount < 0), "text-lime-600": useColors && (flipColors ? amount <= 0 : amount >= 0) })}>
            {style === "inline" && " "}{prefix && prefix}{typeof amount === "number" ? amount.toFixed(2) : amount}
            {icon && iconPosition === "end" && <span className="ml-1 [&>*]:inline">{icon}</span>}
        </p>
    </div>;
}

export function EditableFigure({ name, amount, prefix, style, formTitle, formDescription, formDefaultValue, onEdit }: Parameters<typeof Figure>[0] & {

    onEdit: (amount: any) => void;
    formTitle: string;
    formDescription?: string;
    formDefaultValue?: any;

}) {
    const { addForm } = useContext(FloatingFormContext);

    return <div className="w-fit hover:cursor-pointer" onClick={onEdit == null ? undefined : (ev) => {

        addForm({
            title: formTitle,
            description: formDescription,
            questions: [
                {
                    name: name,
                    id: name,
                    type: "string",
                    defaultValue: formDefaultValue,
                    required: true
                }
            ],
            onSubmit: async (data) => {
                const amount = Number.parseFloat(data.get(name) as string);
                if (Number.isNaN(amount)) return "Enter a valid cost! Ex: 0.32";

                console.log("Updating fees: ", amount);
                onEdit(amount);
                return null;
            }
        });

    }}>
        <Figure name={name} prefix={prefix} amount={amount} style={style} icon={<RegularPencil className="inline p-0.5 mb-0.5" />} />
    </div>
}