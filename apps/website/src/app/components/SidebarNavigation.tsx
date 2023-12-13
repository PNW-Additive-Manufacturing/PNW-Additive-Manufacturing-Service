import { CSSProperties } from "react";
import Link from "next/link";

export interface NavigationItem {
    route: string,
    name: string,
    icon: (className: string, active: boolean) => React.JSX.Element,
    active: boolean
}

/**
 * Navigation Sidebar for Dashboards.
 * @returns
 */

export function SidebarNavigation({ items, className, style }: {
    items: NavigationItem[];
    className?: string;
    style?: CSSProperties;
}) {
    const activeItem = items.find(i => i.active);

    return <div
        className="flex justify-center items-center flex-row gap-8 p-6 bg-white rounded-lg"
        style={Object.assign({}, style)}
    >
        {activeItem == null ? null : <p className='font-medium mr-auto'>{activeItem.name}</p>}
        
        {items.map(item => <div key={item.name}><Link href={`/dashboard/maintainer/${item.route}`}>
            <span className="inline rounded-lg">{item.icon(`inline w-7 h-7 ${item.active ? 'fill-blue-600' : 'fill-gray-500'}`, item.active)}</span>
        </Link></div>)}
    </div>;
}
