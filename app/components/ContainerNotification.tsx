export default function ContainerNotification({ title, description, icon }: { title: React.ReactNode, description: React.ReactNode, icon?: React.ReactNode }) {
    return <div className="out p-4 rounded-sm shadow-sm bg-white w-full mt-0">
        <p className="text-sm text-pnw-gold font-semibold mb-1">
            {icon}
            {title}
        </p>

        <p className="text-sm">{description}</p>
    </div>
}