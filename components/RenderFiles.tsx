"use client"

import { extensions } from "@/constants"
import bytesToSize from "@/lib/bytes-to-size"
import compressFileName from "@/lib/compress-file-name"
import fileToIcon from "@/lib/file-to-icon"
import { Check, Loader, ShieldAlert, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select"
import { Skeleton } from "./ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

const RenderFiles = ({ action, isLoaded, updateAction, deleteAction }) => {
	const [defaultValues, setDefaultValues] = useState<string>("video")
	const [selcted, setSelected] = useState<string>("...")

	const download = (action: Action) => {
		const a = document.createElement("a")
		a.style.display = "none"
		a.href = action.url
		a.download = action.output

		document.body.appendChild(a)
		a.click()

		// Clean up after download
		URL.revokeObjectURL(action.url)
		document.body.removeChild(a)
	}

	return (
		<div className="w-full py-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between">
			{!isLoaded && (
				<Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
			)}
			<div className="flex gap-4 items-center">
				<span className="text-2xl text-orange-600">
					{fileToIcon(action.file_type)}
				</span>
				<div className="flex items-center gap-1 w-96">
					<span className="text-md font-medium overflow-x-hidden">
						{compressFileName(action.file_name)}
					</span>
					<span className="text-muted-foreground text-sm">
						({bytesToSize(action.file_size)})
					</span>
				</div>
			</div>

			{action.is_error ? (
				<Badge variant="destructive" className="flex gap-2">
					<span>Error Converting File</span>
					<ShieldAlert />
				</Badge>
			) : action.is_converted ? (
				<Badge variant="default" className="flex gap-2 bg-green-500">
					<span>Done</span>
					<Check />
				</Badge>
			) : action.is_converting ? (
				<Badge variant="default" className="flex gap-2">
					<span>Converting</span>
					<span className="animate-spin">
						<Loader />
					</span>
				</Badge>
			) : (
				<div className="text-muted-foreground text-md flex items-center gap-4">
					<span>Convert to</span>
					<Select
						onValueChange={(value) => {
							if (extensions.audio.includes(value)) {
								setDefaultValues("audio")
							} else if (extensions.video.includes(value)) {
								setDefaultValues("video")
							}
							setSelected(value)
							updateAction(action.file_name, value)
						}}
						value={selcted}
					>
						<SelectTrigger className="w-32 outline-none focus:outline-none focus:ring-0 text-center text-muted-foreground bg-background text-md font-medium">
							<SelectValue placeholder="..." />
						</SelectTrigger>
						<SelectContent className="h-fit">
							{action.file_type.includes("image") && (
								<div className="grid grid-cols-2 gap-2 w-fit">
									{extensions.image.map((elt, i) => (
										<div key={i} className="col-span-1 text-center">
											<SelectItem value={elt} className="mx-auto">
												{elt}
											</SelectItem>
										</div>
									))}
								</div>
							)}
							{action.file_type.includes("video") && (
								<Tabs defaultValue={defaultValues} className="w-full">
									<TabsList className="w-full">
										<TabsTrigger value="video" className="w-full">
											Video
										</TabsTrigger>
										<TabsTrigger value="audio" className="w-full">
											Audio
										</TabsTrigger>
									</TabsList>
									<TabsContent value="video">
										<div className="grid grid-cols-3 gap-2 w-fit">
											{extensions.video.map((elt, i) => (
												<div key={i} className="col-span-1 text-center">
													<SelectItem value={elt} className="mx-auto">
														{elt}
													</SelectItem>
												</div>
											))}
										</div>
									</TabsContent>
									<TabsContent value="audio">
										<div className="grid grid-cols-3 gap-2 w-fit">
											{extensions.audio.map((elt, i) => (
												<div key={i} className="col-span-1 text-center">
													<SelectItem value={elt} className="mx-auto">
														{elt}
													</SelectItem>
												</div>
											))}
										</div>
									</TabsContent>
								</Tabs>
							)}
							{action.file_type.includes("audio") && (
								<div className="grid grid-cols-2 gap-2 w-fit">
									{extensions.audio.map((elt, i) => (
										<div key={i} className="col-span-1 text-center">
											<SelectItem value={elt} className="mx-auto">
												{elt}
											</SelectItem>
										</div>
									))}
								</div>
							)}
						</SelectContent>
					</Select>
				</div>
			)}

			{action.is_converted ? (
				<Button variant="outline" onClick={() => download(action)}>
					Download
				</Button>
			) : (
				<span
					onClick={() => deleteAction(action)}
					className="cursor-pointer hover:bg-muted rounded-full h-10 w-10 flex items-center justify-center text-2xl text-foreground"
				>
					<X />
				</span>
			)}
		</div>
	)
}
export default RenderFiles
