const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
	const cachedImage = imageCache.get(src);

	if (cachedImage) {
		return cachedImage;
	}

	const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
		image.src = src;
	});

	imageCache.set(src, imagePromise);
	return imagePromise;
}

export async function loadImageFromSource(src: string): Promise<HTMLImageElement> {
	return loadImage(src);
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	const objectUrl = URL.createObjectURL(file);

	try {
		return await loadImage(objectUrl);
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

export function clearImageCache(): void {
	imageCache.clear();
}