import Image from 'next/image';

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
export default function SidebarNavigation({items, className}: 
    {
        items: NavigationItem[],
        className?: string
    })
{
    return <div className={className + " flex"} style={{backgroundColor: "rgb(243, 243, 243)", height: "100vh", minWidth: "90px"}}>
        <div className="p-4 w-full h-full">
            <Image className="p-0.5 mt-4 m-auto" src="/assets/logo.svg" alt="Icon" width={65} height={65}></Image>
            <div className="flex items-center flex-col gap-4 pt-8 pb-4 w-full h-full">
                {items.map(item => <div><a href={item.route}>
                    <span className="w-full h-fit px-3 pb-2 rounded-lg">{item.icon(`w-7 h-7 ${item.active ? 'fill-blue-600' : ''}`)}</span>
                </a></div>)}
            </div>
        </div>
    </div>
} 