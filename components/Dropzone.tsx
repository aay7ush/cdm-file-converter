"use client"

import { accepted_files } from "@/constants"
import loadFfmpeg from "@/lib/load-ffmpeg"
import { Action } from "@/types"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { CloudUpload, FileInput } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactDropzone from "react-dropzone"
import ConvertFiles from "./ConvertFiles"
import RenderFiles from "./RenderFiles"
import { toast } from "./ui/use-toast"

const Dropzone = () => {
	const [is_hover, setIsHover] = useState<boolean>(false)
	const [actions, setActions] = useState<Action[]>([])
	const [files, setFiles] = useState<Array<any>>([])
	const [isLoaded, setIsLoaded] = useState<boolean>(false)
	const ffmpegRef = useRef<any>(null)

	const handleUpload = (data: Array<any>): void => {
		setIsHover(false)
		setFiles(data)
		const tmp: Action[] = []
		data.forEach((file: any) => {
			const formData = new FormData()
			tmp.push({
				file_name: file.name,
				file_size: file.size,
				from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
				to: null,
				file_type: file.type,
				file,
				is_converted: false,
				is_converting: false,
				is_error: false,
			})
		})
		setActions(tmp)
	}

	const load = async () => {
		const ffmpeg_response: FFmpeg = await loadFfmpeg()
		ffmpegRef.current = ffmpeg_response
		setIsLoaded(true)
	}

	useEffect(() => {
		load()
	}, [])

	const updateAction = (file_name: String, to: String) => {
		setActions(
			actions.map((action): Action => {
				if (action.file_name === file_name) {
					return {
						...action,
						to,
					}
				}

				return action
			})
		)
	}

	const deleteAction = (action: Action): void => {
		setActions(actions.filter((elt) => elt !== action))
		setFiles(files.filter((elt) => elt.name !== action.file_name))
	}

	if (actions.length) {
		return (
			<div className="space-y-6">
				{actions.map((action: Action, i: any) => (
					<RenderFiles
						key={i}
						action={action}
						isLoaded={isLoaded}
						updateAction={updateAction}
						deleteAction={deleteAction}
					/>
				))}

				<ConvertFiles
					actions={actions}
					setActions={setActions}
					setFiles={setFiles}
					ffmpegRef={ffmpegRef}
				/>
			</div>
		)
	}

	return (
		<ReactDropzone
			onDrop={handleUpload}
			onDragEnter={() => setIsHover(true)}
			onDragLeave={() => setIsHover(false)}
			accept={accepted_files}
			onDropRejected={() => {
				setIsHover(false)
				toast({
					variant: "destructive",
					title: "Error uploading your file(s)",
					description: "Allowed Files: Audio, Video and Images.",
					duration: 5000,
				})
			}}
			onError={() => {
				setIsHover(false)
				toast({
					variant: "destructive",
					title: "Error uploading your file(s)",
					description: "Allowed Files: Audio, Video and Images.",
					duration: 5000,
				})
			}}
		>
			{({ getRootProps, getInputProps }) => (
				<div
					{...getRootProps()}
					className=" bg-background h-72 lg:h-80 xl:h-96 rounded-3xl shadow-sm border-secondary border-2 border-dashed cursor-pointer flex items-center justify-center"
				>
					<input {...getInputProps()} />
					<div className="space-y-4 text-foreground">
						{is_hover ? (
							<>
								<div className="justify-center flex text-6xl">
									<FileInput />
								</div>
								<h3 className="text-center font-medium text-2xl">
									Yes, right there
								</h3>
							</>
						) : (
							<>
								<div className="justify-center flex text-6xl">
									<CloudUpload />
								</div>
								<h3 className="text-center font-medium text-2xl">
									Click, or drop your files here
								</h3>
							</>
						)}
					</div>
				</div>
			)}
		</ReactDropzone>
	)
}
export default Dropzone
