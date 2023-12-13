export default function HorizontalWrap({children, className}: {children: any, className?: string}) {
    return <div className={`mx-auto w-full px-5 py-3 lg:w-3/4 xl:w-3/4 ${className ?? ''}`}>
        {children}
    </div>
}