import { SetStateAction } from "react"

export type Action = {
	file: any
	file_name: string
	file_size: number
	from: string
	to: String | null
	file_type: string
	is_converting?: boolean
	is_converted?: boolean
	is_error?: boolean
	url?: any
	output?: any
}

export type RenderFilesProps = {
	action: Action
	isLoaded: Boolean
	updateAction: (file_name: String, to: String) => void
	deleteAction: (action: Action) => void
}

export type ConvertFilesProps = {
	actions: Action[]
	setActions: React.Dispatch<SetStateAction<Action[]>>
	setFiles: React.Dispatch<SetStateAction<any[]>>
	ffmpegRef: any
}
