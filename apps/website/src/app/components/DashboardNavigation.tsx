import Image from 'next/image';
import { CSSProperties } from 'react';

export interface NavigationItem 
{
    route: string,
    name: string,
    icon: (className: string) => React.JSX.Element,
    active: boolean
}

/**
 * Navigation Sidebar for Dashboards.
 * @returns 
 */
export default function SidebarNavigation({items, className, style}: 
    {
        items: NavigationItem[],
        className?: string,
        style?: CSSProperties
    })
{
    const activeItem = items.find(i => i.active);

    console.log(style);

    return<div className="p-2 h-fit w-screen lg:p-4 lg:w-fit lg:h-screen" style={Object.assign({backgroundColor: "rgb(242, 242, 242)"}, style)}>
        <div className="flex justify-center items-center sm:flex-row lg:flex-col gap-8 py-2">
            {activeItem == null ? null : <p className='font-medium lg:hidden'>{activeItem.name}</p>}
            <Image className="hidden lg:block p-1.5 lg:p-1" src="/assets/logo.svg" alt="Icon" width={65} height={65}></Image>
            {items.map(item => <div key={item.name}><a href={`/dashboard/maintainer/${item.route}`}>
                <span className="inline rounded-lg">{item.icon(`inline w-7 h-7 ${item.active ? 'fill-blue-600' : 'fill-gray-500'}`)}</span>
            </a></div>)}
        </div>
    </div>
}