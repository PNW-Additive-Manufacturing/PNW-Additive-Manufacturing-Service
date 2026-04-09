"use client";

import {
	addFilament,
	addManufacturingMethod,
	addMaterial,
	deleteFilament,
	deleteManufacturingMethod,
	deleteMaterial,
	editFilament,
	editManufacturingMethod,
	editMaterial,
	setFilamentArchived,
	setFilamentInStock,
} from "@/app/api/server-actions/maintainer";
import IconByName from "@/app/components/IconByName";
import { styleCSSSwatch } from "@/app/components/Swatch";
import Filament from "@/app/Types/Filament/Filament";
import { ManufacturingMethod } from "@/app/Types/ManufacturingMethod/ManufacturingMethod";
import { Material } from "@/app/Types/Material/Material";
import { Dialog } from "@headlessui/react";
import classNames from "classnames";
import React, { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { FaBoxArchive, FaBoxOpen, FaLayerGroup, FaPalette, FaPen, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function displayName(item: { wholeName?: string | null; shortName: string }): string {
	const whole = item.wholeName?.trim();
	return whole && whole.length > 0 ? whole : item.shortName;
}

// -----------------------------------------------------------------------------
// Section - vertical flow wrapper
// -----------------------------------------------------------------------------

function Section({
	icon,
	title,
	description,
	addLabel,
	onAdd,
	children,
}: React.PropsWithChildren<{
	icon: React.ReactElement;
	title: string;
	description?: string;
	addLabel: string;
	onAdd: () => void;
}>) {
	return (
		<div className="bg-white rounded-lg p-8 flex flex-col gap-6 drop-shadow-sm">
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div className="min-w-0">
					<p className="font-medium text-lg flex gap-2 items-center [&>*]:fill-pnw-gold text-gray-800">
						{icon}
						{title}
					</p>
					{description && (
						<p className="text-sm font-light mt-1 text-gray-600 break-words">
							{description}
						</p>
					)}
				</div>
				<button
					type="button"
					onClick={onAdd}
					className="text-sm mb-0 w-fit shadow-sm flex items-center gap-2">
					<FaPlus className="w-3 h-3" /> {addLabel}
				</button>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{children}
			</div>
		</div>
	);
}

// -----------------------------------------------------------------------------
// SelectableCard - for methods and materials
// -----------------------------------------------------------------------------

function SelectableCard({
	icon,
	title,
	subtitle,
	description,
	meta,
	selected,
	onSelect,
	onEdit,
	onDelete,
}: {
	icon?: React.ReactElement;
	title: string;
	subtitle?: string;
	description?: string;
	meta?: string;
	selected: boolean;
	onSelect: () => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<div
			onClick={onSelect}
			className={classNames(
				"border-2 border-black/10 rounded-lg p-5 flex flex-col gap-3 relative group transition-transform hover:border-pnw-gold hover:-translate-y-0.5 hover:shadow-md hover:cursor-pointer bg-white",
				{ "border-pnw-gold shadow-lg -translate-y-0.5": selected }
			)}>
			{/* Selection indicator circle - top right */}
			<div className="rounded-full border-2 border-black/10 p-0.5 w-5 h-5 absolute top-3 right-3 bg-white">
				{selected && <div className="w-full h-full rounded-full bg-pnw-gold" />}
			</div>

			{/* Edit button - hover reveal, offset left of the delete button */}
			<button
				type="button"
				title={`Edit ${title}`}
				onClick={(e) => {
					e.stopPropagation();
					onEdit();
				}}
				className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-16 text-gray-400 hover:text-pnw-gold bg-transparent hover:bg-transparent mb-0 p-1 w-fit">
				<FaPen className="w-3 h-3" />
			</button>

			{/* Delete button - hover reveal, offset left of the selection circle */}
			<button
				type="button"
				title={`Delete ${title}`}
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-10 text-gray-400 hover:text-red-500 bg-transparent hover:bg-transparent mb-0 p-1 w-fit">
				<FaTrash className="w-3 h-3" />
			</button>

			{icon && (
				<div className="w-9 h-9 [&>*]:w-9 [&>*]:h-9 opacity-70">
					{icon}
				</div>
			)}

			<div className="pr-14">
				<p className="font-semibold text-lg break-words text-gray-800 leading-tight">
					{title}
				</p>
				{subtitle && subtitle !== title && (
					<p className="text-xs text-gray-500 font-light mt-1 break-words">
						{subtitle}
					</p>
				)}
			</div>

			{description && description.trim().length > 0 && (
				<p className="text-sm font-light text-gray-600 break-words line-clamp-3">
					{description}
				</p>
			)}

			{meta && (
				<p className="text-xs text-gray-500 font-light mt-auto break-words">
					{meta}
				</p>
			)}
		</div>
	);
}

// -----------------------------------------------------------------------------
// ColorVariantCard - for filament color variants
// -----------------------------------------------------------------------------

function ColorVariantCard({ filament, onEdit }: { filament: Filament; onEdit: () => void }) {
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		if (!confirm(`Permanently delete ${filament.material.shortName} / ${filament.color.name}? This only works if no existing parts reference it; otherwise archive it instead.`)) return;
		const fd = new FormData();
		fd.append("filament-id", String(filament.id));
		startTransition(async () => {
			const err = await deleteFilament("", fd);
			if (err) toast.error(err);
			else toast.success(`Deleted ${filament.material.shortName} ${filament.color.name}.`);
		});
	};

	const handleToggleArchived = () => {
		const nextArchived = !filament.isArchived;
		const verb = nextArchived ? "Archive" : "Unarchive";
		if (nextArchived && !confirm(`Archive ${filament.material.shortName} / ${filament.color.name}? It will be hidden from new orders but kept for history.`)) return;
		const fd = new FormData();
		fd.append("filament-id", String(filament.id));
		fd.append("filament-archived", String(nextArchived));
		startTransition(async () => {
			const err = await setFilamentArchived("", fd);
			if (err) toast.error(err);
			else toast.success(`${verb}d ${filament.material.shortName} ${filament.color.name}.`);
		});
	};

	return (
		<div className={classNames(
			"border-2 border-black/10 rounded-lg p-4 flex flex-col gap-3 group relative bg-white transition-transform hover:border-pnw-gold/60 hover:shadow-sm",
			{ "opacity-60": filament.isArchived }
		)}>
			{/* Archived badge */}
			{filament.isArchived && (
				<div className="absolute top-2 left-2 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
					Archived
				</div>
			)}

			{/* Swatch */}
			<div
				className="w-full h-20 rounded-md shadow-sm outline outline-1 outline-gray-200"
				style={styleCSSSwatch(filament.color)}
			/>

			{/* Name + meta */}
			<div className="min-w-0">
				<p className="font-medium text-base text-gray-800 break-words leading-tight">
					{filament.color.name}
				</p>
				<p className="text-xs text-gray-500 font-light mt-0.5">
					${(filament.costPerGramInCents / 100).toFixed(3)}/g ·{" "}
					{filament.leadTimeInDays}d lead
				</p>
			</div>

			{/* Stock toggle + actions */}
			<div className="flex items-center justify-between gap-2 mt-auto">
				<form action={async (fd) => { await setFilamentInStock("", fd); }}>
					<input type="hidden" name="filament-id" value={filament.id} />
					<input
						type="hidden"
						name="filament-instock"
						value={String(!filament.inStock)}
					/>
					<button
						type="submit"
						disabled={filament.isArchived}
						title={filament.isArchived ? "Unarchive before toggling stock" : filament.inStock ? "Mark out of stock" : "Mark in stock"}
						className={classNames(
							"text-xs mb-0 px-3 py-1 rounded-full border-2 transition-colors w-fit",
							filament.inStock
								? "border-pnw-gold/40 text-pnw-gold bg-transparent hover:bg-transparent hover:border-red-300 hover:text-red-500"
								: "border-black/10 text-gray-400 bg-transparent hover:bg-transparent hover:border-pnw-gold/50 hover:text-pnw-gold"
						)}>
						{filament.inStock ? "In stock" : "Out of stock"}
					</button>
				</form>
				<div className="flex items-center gap-1">
					<button
						type="button"
						title="Edit variant"
						onClick={onEdit}
						disabled={isPending}
						className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-pnw-gold bg-transparent hover:bg-transparent mb-0 p-1 w-fit">
						<FaPen className="w-3 h-3" />
					</button>
					<button
						type="button"
						title={filament.isArchived ? "Unarchive variant" : "Archive variant (hide from new orders)"}
						onClick={handleToggleArchived}
						disabled={isPending}
						className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-pnw-gold bg-transparent hover:bg-transparent mb-0 p-1 w-fit">
						{filament.isArchived ? <FaBoxOpen className="w-3 h-3" /> : <FaBoxArchive className="w-3 h-3" />}
					</button>
					<button
						type="button"
						title="Delete variant permanently (only if unused)"
						onClick={handleDelete}
						disabled={isPending}
						className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 bg-transparent hover:bg-transparent mb-0 p-1 w-fit">
						<FaTrash className="w-3 h-3" />
					</button>
				</div>
			</div>
		</div>
	);
}

// -----------------------------------------------------------------------------
// Modal - reusable Dialog wrapper
// -----------------------------------------------------------------------------

function Modal({
	open,
	onClose,
	title,
	icon,
	children,
}: React.PropsWithChildren<{
	open: boolean;
	onClose: () => void;
	title: string;
	icon?: React.ReactElement;
}>) {
	return (
		<Dialog open={open} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			<div className="fixed inset-0 flex w-screen items-start justify-center overflow-y-auto p-4 lg:p-12">
				<Dialog.Panel className="rounded-lg bg-white p-8 w-full max-w-xl flex flex-col gap-6 drop-shadow-xl my-auto">
					<Dialog.Title as="div" className="flex items-center justify-between gap-4">
						<p className="font-medium text-xl flex gap-2 items-center [&>*]:fill-pnw-gold text-gray-800">
							{icon}
							{title}
						</p>
						<button
							type="button"
							onClick={onClose}
							title="Close"
							className="text-sm mb-0 bg-transparent text-gray-500 hover:bg-transparent hover:text-black p-1 w-fit">
							<FaXmark className="w-5 h-5" />
						</button>
					</Dialog.Title>
					{children}
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}

// -----------------------------------------------------------------------------
// Form field helpers
// -----------------------------------------------------------------------------

function Field({
	label,
	hint,
	children,
}: React.PropsWithChildren<{ label: string; hint?: string }>) {
	return (
		<div className="flex flex-col">
			<label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
			{children}
			{hint && <p className="text-xs text-gray-500 font-light mt-1">{hint}</p>}
		</div>
	);
}

function FormActions({
	onCancel,
	isPending,
	error,
	saveLabel = "Save",
}: {
	onCancel: () => void;
	isPending: boolean;
	error?: string;
	saveLabel?: string;
}) {
	return (
		<div className="flex flex-col gap-2">
			{error && <p className="text-warning text-sm font-light">{error}</p>}
			<div className="flex justify-end gap-2 items-center">
				<button
					type="button"
					onClick={onCancel}
					className="text-sm mb-0 w-fit bg-transparent text-black hover:text-black hover:bg-transparent">
					Cancel
				</button>
				<button
					type="submit"
					disabled={isPending}
					className="text-sm mb-0 w-fit shadow-sm">
					{isPending ? "Saving..." : saveLabel}
				</button>
			</div>
		</div>
	);
}

// -----------------------------------------------------------------------------
// MethodForm - create or edit a manufacturing method
// -----------------------------------------------------------------------------

function MethodForm({
	initial,
	onDone,
}: {
	initial?: ManufacturingMethod;
	onDone: () => void;
}) {
	const isEdit = !!initial;
	const [error, setError] = useState<string>("");
	const [isPending, startTransition] = useTransition();

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				const fd = new FormData(e.currentTarget);
				startTransition(async () => {
					const err = isEdit
						? await editManufacturingMethod("", fd)
						: await addManufacturingMethod("", fd);
					if (err) setError(err);
					else {
						setError("");
						onDone();
					}
				});
			}}>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field
					label="Short name *"
					hint={isEdit ? "Cannot be changed after creation" : "Abbreviation used in URLs and lookups"}>
					<input
						name="shortName"
						required
						placeholder="FDM"
						defaultValue={initial?.shortName}
						readOnly={isEdit}
						className={classNames("w-full mb-0", {
							"bg-gray-100 text-gray-500 cursor-not-allowed": isEdit,
						})}
					/>
				</Field>
				<Field label="Full name *" hint="Human-readable name shown to customers">
					<input
						name="wholeName"
						required
						placeholder="Fused Deposition Modeling"
						defaultValue={initial?.wholeName}
						className="w-full mb-0"
					/>
				</Field>
			</div>
			<Field label="Description">
				<textarea
					name="description"
					rows={3}
					placeholder="Layer-by-layer extrusion of thermoplastic filament."
					defaultValue={initial?.description ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field label="Icon" hint="Font Awesome icon name">
					<input
						name="icon"
						placeholder="fa:Bolt"
						defaultValue={initial?.icon ?? ""}
						className="w-full mb-0"
					/>
				</Field>
				<Field label="Unit" hint="Default: g">
					<input
						name="unit"
						placeholder="g"
						defaultValue={(initial as any)?.unit ?? "g"}
						className="w-full mb-0"
					/>
				</Field>
			</div>
			<Field label="Company">
				<input
					name="company"
					placeholder="Prusa Research"
					defaultValue={(initial as any)?.company ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<Field label="Benefits" hint="Comma-separated">
				<input
					name="benefits"
					placeholder="Low cost, wide material selection, fast turnaround"
					defaultValue={initial?.benefits?.join(", ") ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<Field label="Cons" hint="Comma-separated">
				<input
					name="cons"
					placeholder="Visible layer lines, limited overhangs"
					defaultValue={initial?.cons?.join(", ") ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<FormActions
				onCancel={onDone}
				isPending={isPending}
				error={error}
				saveLabel={isEdit ? "Save changes" : "Create method"}
			/>
		</form>
	);
}

// -----------------------------------------------------------------------------
// MaterialForm - create or edit a material
// -----------------------------------------------------------------------------

function MaterialForm({
	initial,
	onDone,
}: {
	initial?: Material;
	onDone: () => void;
}) {
	const isEdit = !!initial;
	const [error, setError] = useState<string>("");
	const [isPending, startTransition] = useTransition();

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				const fd = new FormData(e.currentTarget);
				startTransition(async () => {
					const err = isEdit
						? await editMaterial("", fd)
						: await addMaterial("", fd);
					if (err) setError(err);
					else {
						setError("");
						onDone();
					}
				});
			}}>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field
					label="Short name *"
					hint={isEdit ? "Cannot be changed after creation" : "Abbreviation used in URLs and lookups"}>
					<input
						name="shortName"
						required
						placeholder="PLA"
						defaultValue={initial?.shortName}
						readOnly={isEdit}
						className={classNames("w-full mb-0", {
							"bg-gray-100 text-gray-500 cursor-not-allowed": isEdit,
						})}
					/>
				</Field>
				<Field label="Full name *" hint="Human-readable name shown to customers">
					<input
						name="wholeName"
						required
						placeholder="Polylactic Acid"
						defaultValue={initial?.wholeName}
						className="w-full mb-0"
					/>
				</Field>
			</div>
			<Field label="Description">
				<textarea
					name="description"
					rows={3}
					placeholder="Biodegradable, easy-to-print, rigid plastic suited for prototyping and display parts."
					defaultValue={initial?.description ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<Field label="Icon" hint="Font Awesome icon name">
				<input
					name="icon"
					placeholder="fa:Cube"
					defaultValue={initial?.icon ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<Field label="Benefits" hint="Comma-separated">
				<input
					name="benefits"
					placeholder="Biodegradable, low warp, wide color selection"
					defaultValue={initial?.benefits?.join(", ") ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<Field label="Cons" hint="Comma-separated">
				<input
					name="cons"
					placeholder="Brittle, low heat resistance"
					defaultValue={initial?.cons?.join(", ") ?? ""}
					className="w-full mb-0"
				/>
			</Field>
			<FormActions
				onCancel={onDone}
				isPending={isPending}
				error={error}
				saveLabel={isEdit ? "Save changes" : "Create material"}
			/>
		</form>
	);
}

// -----------------------------------------------------------------------------
// ColorVariantForm - create or edit a filament color variant
// -----------------------------------------------------------------------------

function ColorVariantForm({
	methodShortName,
	materialShortName,
	initial,
	onDone,
}: {
	methodShortName: string;
	materialShortName: string;
	initial?: Filament;
	onDone: () => void;
}) {
	const isEdit = !!initial;
	const initialIsGradient = initial ? "diColor" in initial.color : false;

	const [colorType, setColorType] = useState<"mono" | "gradient">(
		initialIsGradient ? "gradient" : "mono"
	);
	const [error, setError] = useState<string>("");
	const [isPending, startTransition] = useTransition();

	const initialMono =
		initial && "monoColor" in initial.color ? initial.color.monoColor : "#ffffff";
	const initialDiA =
		initial && "diColor" in initial.color ? initial.color.diColor.colorA : "#ffffff";
	const initialDiB =
		initial && "diColor" in initial.color ? initial.color.diColor.colorB : "#000000";

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				const fd = new FormData(e.currentTarget);
				startTransition(async () => {
					const result = isEdit
						? await editFilament("", fd)
						: await addFilament("", fd);
					if (result.error) setError(result.error);
					else {
						setError("");
						onDone();
					}
				});
			}}>
			{isEdit ? (
				<input type="hidden" name="filament-id" value={initial!.id} />
			) : (
				<>
					<input type="hidden" name="filament-material" value={materialShortName} />
					<input type="hidden" name="filament-method" value={methodShortName} />
				</>
			)}

			<Field label="Color name *" hint="Shown to customers on the request page">
				<input
					name="filament-colorName"
					required
					placeholder="Pearl White"
					defaultValue={initial?.color.name}
					className="w-full mb-0"
				/>
			</Field>

			<Field label="Color type">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setColorType("mono")}
						className={classNames(
							"px-3 py-1.5 rounded-md text-xs border-2 mb-0 w-fit",
							colorType === "mono"
								? "border-pnw-gold bg-pnw-gold/10 text-pnw-gold"
								: "border-black/10 bg-transparent text-gray-600 hover:bg-transparent hover:border-pnw-gold/50"
						)}>
						Single color
					</button>
					<button
						type="button"
						onClick={() => setColorType("gradient")}
						className={classNames(
							"px-3 py-1.5 rounded-md text-xs border-2 mb-0 w-fit",
							colorType === "gradient"
								? "border-pnw-gold bg-pnw-gold/10 text-pnw-gold"
								: "border-black/10 bg-transparent text-gray-600 hover:bg-transparent hover:border-pnw-gold/50"
						)}>
						Gradient
					</button>
				</div>
			</Field>

			{colorType === "mono" ? (
				<Field label="Color">
					<input
						key="mono"
						name="filament-mono-color"
						type="color"
						defaultValue={initialMono}
						className="w-full h-12 rounded mb-0"
					/>
				</Field>
			) : (
				<div className="grid grid-cols-2 gap-4">
					<Field label="Color A">
						<input
							key="diA"
							name="filament-di-colorA"
							type="color"
							defaultValue={initialDiA}
							className="w-full h-12 rounded mb-0"
						/>
					</Field>
					<Field label="Color B">
						<input
							key="diB"
							name="filament-di-colorB"
							type="color"
							defaultValue={initialDiB}
							className="w-full h-12 rounded mb-0"
						/>
					</Field>
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field label="Cost per gram ($)" hint="Raw material cost charged to the customer">
					<input
						name="filament-material-cost"
						type="number"
						step="0.001"
						min="0"
						placeholder="0.025"
						defaultValue={
							initial
								? (initial.costPerGramInCents / 100).toFixed(3)
								: ""
						}
						className="w-full mb-0"
					/>
				</Field>
				<Field label="Lead time (days) *" hint="Days until this variant is ready to print">
					<input
						name="filament-lead-time-in-days"
						type="number"
						min="0"
						required
						placeholder="0"
						defaultValue={initial?.leadTimeInDays ?? 0}
						className="w-full mb-0"
					/>
				</Field>
			</div>

			<Field label="Description" hint="Optional notes about this variant">
				<input
					name="filament-details"
					placeholder="Silky finish, limited stock"
					defaultValue={initial?.description ?? ""}
					className="w-full mb-0"
				/>
			</Field>

			<FormActions
				onCancel={onDone}
				isPending={isPending}
				error={error}
				saveLabel={isEdit ? "Save changes" : "Create variant"}
			/>
		</form>
	);
}

// -----------------------------------------------------------------------------
// Main FilamentManager
// -----------------------------------------------------------------------------

type OpenModal =
	| null
	| { kind: "method"; editing?: ManufacturingMethod }
	| { kind: "material"; editing?: Material }
	| { kind: "color"; editing?: Filament };

export default function FilamentManager({
	methods,
	materials,
	filaments,
}: {
	methods: ManufacturingMethod[];
	materials: Material[];
	filaments: Filament[];
}) {
	const [selectedMethod, setSelectedMethod] = useState<ManufacturingMethod | undefined>();
	const [selectedMaterial, setSelectedMaterial] = useState<Material | undefined>();
	const [openModal, setOpenModal] = useState<OpenModal>(null);
	const [, startTransition] = useTransition();

	const colorsForSelection =
		selectedMethod && selectedMaterial
			? filaments.filter(
					(f) =>
						f.manufacturingMethod.shortName === selectedMethod.shortName &&
						f.material.shortName === selectedMaterial.shortName
			  )
			: [];

	const handleDeleteMethod = (method: ManufacturingMethod) => {
		if (
			!confirm(
				`Delete "${displayName(method)}"? This will also remove all associated filament variants.`
			)
		)
			return;
		const fd = new FormData();
		fd.append("shortName", method.shortName);
		startTransition(async () => {
			await deleteManufacturingMethod("", fd);
			if (selectedMethod?.shortName === method.shortName) {
				setSelectedMethod(undefined);
				setSelectedMaterial(undefined);
			}
		});
	};

	const handleDeleteMaterial = (mat: Material) => {
		if (
			!confirm(
				`Delete "${displayName(mat)}"? This will also remove all associated filament variants.`
			)
		)
			return;
		const fd = new FormData();
		fd.append("shortName", mat.shortName);
		startTransition(async () => {
			await deleteMaterial("", fd);
			if (selectedMaterial?.shortName === mat.shortName) {
				setSelectedMaterial(undefined);
			}
		});
	};

	return (
		<div className="flex flex-col gap-6">
			{/* ----- Section 1: Manufacturing Methods ----- */}
			<Section
				icon={<FaLayerGroup className="w-5 h-5" />}
				title="Manufacturing Method"
				description="Select a printing process to configure the materials and color variants offered for it."
				addLabel="Add method"
				onAdd={() => setOpenModal({ kind: "method" })}>
				{methods.length === 0 && (
					<p className="text-sm text-gray-400 font-light col-span-full">
						No manufacturing methods yet. Click &ldquo;Add method&rdquo; to create one.
					</p>
				)}
				{methods.map((method) => (
					<SelectableCard
						key={method.shortName}
						icon={
							method.icon ? (
								<IconByName iconWholeName={method.icon as any} />
							) : undefined
						}
						title={displayName(method)}
						subtitle={method.shortName}
						description={method.description}
						selected={selectedMethod?.shortName === method.shortName}
						onSelect={() => {
							setSelectedMethod(method);
							setSelectedMaterial(undefined);
						}}
						onEdit={() => setOpenModal({ kind: "method", editing: method })}
						onDelete={() => handleDeleteMethod(method)}
					/>
				))}
			</Section>

			{/* ----- Section 2: Materials ----- */}
			{selectedMethod && (
				<Section
					icon={<FaLayerGroup className="w-5 h-5" />}
					title={`Material - ${displayName(selectedMethod)}`}
					description="Choose the material to view and manage its color variants."
					addLabel="Add material"
					onAdd={() => setOpenModal({ kind: "material" })}>
					{materials.length === 0 && (
						<p className="text-sm text-gray-400 font-light col-span-full">
							No materials yet. Click &ldquo;Add material&rdquo; to create one.
						</p>
					)}
					{materials.map((mat) => {
						const variantCount = filaments.filter(
							(f) =>
								f.manufacturingMethod.shortName ===
									selectedMethod.shortName &&
								f.material.shortName === mat.shortName
						).length;
						return (
							<SelectableCard
								key={mat.shortName}
								icon={
									mat.icon ? (
										<IconByName iconWholeName={mat.icon as any} />
									) : undefined
								}
								title={displayName(mat)}
								subtitle={mat.shortName}
								description={mat.description}
								meta={
									variantCount > 0
										? `${variantCount} color variant${variantCount === 1 ? "" : "s"}`
										: "No variants for this method"
								}
								selected={selectedMaterial?.shortName === mat.shortName}
								onSelect={() => setSelectedMaterial(mat)}
								onEdit={() => setOpenModal({ kind: "material", editing: mat })}
								onDelete={() => handleDeleteMaterial(mat)}
							/>
						);
					})}
				</Section>
			)}

			{/* ----- Section 3: Color Variants ----- */}
			{selectedMethod && selectedMaterial && (
				<Section
					icon={<FaPalette className="w-5 h-5" />}
					title={`Color Variants - ${displayName(selectedMaterial)}`}
					description={`Manage individual filament colors for ${displayName(selectedMaterial)} on ${displayName(selectedMethod)}.`}
					addLabel="Add variant"
					onAdd={() => setOpenModal({ kind: "color" })}>
					{colorsForSelection.length === 0 && (
						<p className="text-sm text-gray-400 font-light col-span-full">
							No color variants yet for this material. Click &ldquo;Add variant&rdquo; to create one.
						</p>
					)}
					{colorsForSelection.map((filament) => (
						<ColorVariantCard
							key={filament.id}
							filament={filament}
							onEdit={() => setOpenModal({ kind: "color", editing: filament })}
						/>
					))}
				</Section>
			)}

			{/* ----- Modals ----- */}
			<Modal
				open={openModal?.kind === "method"}
				onClose={() => setOpenModal(null)}
				icon={<FaLayerGroup className="w-5 h-5" />}
				title={
					openModal?.kind === "method" && openModal.editing
						? `Edit Manufacturing Method - ${displayName(openModal.editing)}`
						: "Add Manufacturing Method"
				}>
				<MethodForm
					key={
						openModal?.kind === "method"
							? openModal.editing?.shortName ?? "new"
							: "new"
					}
					initial={openModal?.kind === "method" ? openModal.editing : undefined}
					onDone={() => setOpenModal(null)}
				/>
			</Modal>

			<Modal
				open={openModal?.kind === "material"}
				onClose={() => setOpenModal(null)}
				icon={<FaLayerGroup className="w-5 h-5" />}
				title={
					openModal?.kind === "material" && openModal.editing
						? `Edit Material - ${displayName(openModal.editing)}`
						: "Add Material"
				}>
				<MaterialForm
					key={
						openModal?.kind === "material"
							? openModal.editing?.shortName ?? "new"
							: "new"
					}
					initial={openModal?.kind === "material" ? openModal.editing : undefined}
					onDone={() => setOpenModal(null)}
				/>
			</Modal>

			{selectedMethod && selectedMaterial && (
				<Modal
					open={openModal?.kind === "color"}
					onClose={() => setOpenModal(null)}
					icon={<FaPalette className="w-5 h-5" />}
					title={
						openModal?.kind === "color" && openModal.editing
							? `Edit Color Variant - ${openModal.editing.color.name}`
							: `Add Color Variant - ${displayName(selectedMaterial)}`
					}>
					<ColorVariantForm
						key={
							openModal?.kind === "color"
								? openModal.editing?.id ?? "new"
								: "new"
						}
						methodShortName={selectedMethod.shortName}
						materialShortName={selectedMaterial.shortName}
						initial={openModal?.kind === "color" ? openModal.editing : undefined}
						onDone={() => setOpenModal(null)}
					/>
				</Modal>
			)}
		</div>
	);
}
