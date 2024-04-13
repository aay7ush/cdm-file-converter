"use client"

import { accepted_files } from "@/constants"
import convertFile from "@/lib/convert"
import loadFfmpeg from "@/lib/load-ffmpeg"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { CloudUpload, Download, FileInput, Loader } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactDropzone from "react-dropzone"
import RenderFiles from "./RenderFiles"
import { Button } from "./ui/button"
import { toast } from "./ui/use-toast"

const Dropzone = () => {
	const [is_hover, setIsHover] = useState<boolean>(false)
	const [actions, setActions] = useState<Action[]>([])
	const [files, setFiles] = useState<Array<any>>([])
	const [isLoaded, setIsLoaded] = useState<boolean>(false)
	const ffmpegRef = useRef<any>(null)
	const [is_ready, setIsReady] = useState<boolean>(false)
	const [is_done, setIsDone] = useState<boolean>(false)
	const [is_converting, setIsConverting] = useState<boolean>(false)

	const handleUpload = (data: Array<any>): void => {
		handleExitHover()
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

	const handleHover = (): void => setIsHover(true)

	const handleExitHover = (): void => setIsHover(false)

	const convert = async (): Promise<any> => {
		let tmp_actions = actions.map((elt) => ({
			...elt,
			is_converting: true,
		}))
		setActions(tmp_actions)
		setIsConverting(true)
		for (let action of tmp_actions) {
			try {
				const { url, output } = await convertFile(ffmpegRef.current, action)
				tmp_actions = tmp_actions.map((elt) =>
					elt === action
						? {
								...elt,
								is_converted: true,
								is_converting: false,
								url,
								output,
						  }
						: elt
				)
				setActions(tmp_actions)
			} catch (err) {
				tmp_actions = tmp_actions.map((elt) =>
					elt === action
						? {
								...elt,
								is_converted: false,
								is_converting: false,
								is_error: true,
						  }
						: elt
				)
				setActions(tmp_actions)
			}
		}
		setIsDone(true)
		setIsConverting(false)
	}

	useEffect(() => {
		if (!actions.length) {
			setIsDone(false)
			setFiles([])
			setIsReady(false)
			setIsConverting(false)
		} else checkIsReady()
	}, [actions])

	useEffect(() => {
		load()
	}, [])

	const load = async () => {
		const ffmpeg_response: FFmpeg = await loadFfmpeg()
		ffmpegRef.current = ffmpeg_response
		setIsLoaded(true)
	}

	const updateAction = (file_name: String, to: String) => {
		setActions(
			actions.map((action): Action => {
				if (action.file_name === file_name) {
					console.log("FOUND")
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

	const downloadAll = (): void => {
		for (let action of actions) {
			!action.is_error && download(action)
		}
	}

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

	const reset = () => {
		setIsDone(false)
		setActions([])
		setFiles([])
		setIsReady(false)
		setIsConverting(false)
	}

	const checkIsReady = (): void => {
		let tmp_is_ready = true
		actions.forEach((action: Action) => {
			if (!action.to) tmp_is_ready = false
		})
		setIsReady(tmp_is_ready)
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
				<div className="flex w-full justify-end">
					{is_done ? (
						<div className="space-y-4 w-fit">
							<Button
								size="lg"
								className="rounded-xl font-semibold relative py-4 text-md flex gap-2 items-center w-full"
								onClick={downloadAll}
							>
								{actions.length > 1 ? "Download All" : "Download"}
								<Download />
							</Button>
							<Button
								size="lg"
								onClick={reset}
								variant="outline"
								className="rounded-xl"
							>
								Convert Another File(s)
							</Button>
						</div>
					) : (
						<Button
							size="lg"
							disabled={!is_ready || is_converting}
							className="rounded-xl font-semibold relative py-4 text-md flex items-center w-44"
							onClick={convert}
						>
							{is_converting ? (
								<span className="animate-spin text-lg">
									<Loader />
								</span>
							) : (
								<span>Convert Now</span>
							)}
						</Button>
					)}
				</div>
			</div>
		)
	}

	return (
		<ReactDropzone
			onDrop={handleUpload}
			onDragEnter={handleHover}
			onDragLeave={handleExitHover}
			accept={accepted_files}
			onDropRejected={() => {
				handleExitHover()
				toast({
					variant: "destructive",
					title: "Error uploading your file(s)",
					description: "Allowed Files: Audio, Video and Images.",
					duration: 5000,
				})
			}}
			onError={() => {
				handleExitHover()
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
