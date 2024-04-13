import Dropzone from "@/components/Dropzone"

export default function Home() {
	return (
		<section className="space-y-16 pb-8">
			<div className="space-y-6 text-center">
				<h1 className="text-3xl md:text-5xl font-medium">
					Free Unlimited File Converter
				</h1>
				<p className="text-muted-foreground md:text-lg md:px-24 xl:px-44 2xl:px-52">
					Unleash your creativity – the ultimate online tool for unlimited and
					free multimedia conversion. Transform images, audio, and videos
					effortlessly, without restrictions. Start converting now and elevate
					your content like never before!
				</p>
			</div>

			<Dropzone />
		</section>
	)
}
