import classNames from 'classnames';
import { IconType } from 'react-icons';
import { ICON_LIBRARIES, ICON_PREFIXES, IconString, IconStringSchema } from '../Types/IconString';

function IconByName({ iconWholeName, className }: { iconWholeName: IconString; className?: string;}) 
{
    try
    {
        iconWholeName = IconStringSchema.parse(iconWholeName);
    }
    catch (err)
    {
        console.warn(err);
        return <div className={classNames(className)} />;
    }

    const [iconCategory, iconName] = iconWholeName.split(':');

    const iconLibrary = ICON_LIBRARIES[iconCategory];
    const iconPrefix = ICON_PREFIXES[iconCategory];

    if (!iconLibrary || !iconPrefix) 
    {
        console.warn(`Unknown icon category: "${iconCategory}" in "${iconWholeName}"`);
        return <div className={classNames(className)} />;
    }

    const iconKey = `${iconPrefix}${iconName}`;
    const DynamicIcon = iconLibrary[iconKey] as IconType | undefined;

    if (!DynamicIcon) {
        console.warn(`Icon not found: "${iconWholeName}" (Category: ${iconCategory}, Name: ${iconName})`);
        return <div className={classNames(className)} />;
    }

    return <DynamicIcon className={classNames(className)} />;
}

export default IconByName;