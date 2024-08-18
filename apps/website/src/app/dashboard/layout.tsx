import HorizontalWrap from "@/app/components/HorizontalWrap";

export default function DashboardLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="w-full p-0">
			<HorizontalWrap>{children}</HorizontalWrap>
		</main>
	);
}
