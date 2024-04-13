import convertFile from "@/lib/convert"
import { Action, ConvertFilesProps } from "@/types"
import { Download, Loader } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

const ConvertFiles: React.FC<ConvertFilesProps> = ({
	actions,
	setActions,
	setFiles,
	ffmpegRef,
}) => {
	const [is_done, setIsDone] = useState<boolean>(false)
	const [is_ready, setIsReady] = useState<boolean>(false)
	const [is_converting, setIsConverting] = useState<boolean>(false)

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

	const reset = () => {
		setIsDone(false)
		setActions([])
		setFiles([])
		setIsReady(false)
		setIsConverting(false)
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

		URL.revokeObjectURL(action.url)
		document.body.removeChild(a)
	}

	const checkIsReady = (): void => {
		let tmp_is_ready = true
		actions.forEach((action: Action) => {
			if (!action.to) tmp_is_ready = false
		})
		setIsReady(tmp_is_ready)
	}

	useEffect(() => {
		if (!actions.length) {
			setIsDone(false)
			setFiles([])
			setIsReady(false)
			setIsConverting(false)
		} else checkIsReady()
	}, [actions])

	return (
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
	)
}
export default ConvertFiles
