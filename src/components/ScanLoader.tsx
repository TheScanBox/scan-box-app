import { useEffect, useState } from "react";
import LoaderGif from "../assets/loader.gif";
import Loading from "./Loading";

export type ScanImage = {
    id: number;
    url: string;
};

type ScanLoaderType = {
    images: ScanImage[];
    luminousity: number;
    pageLoading: boolean;
    setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
    setShowLightConfig: React.Dispatch<React.SetStateAction<boolean>>;
};

type ScanLoaderImageType = {
    id: number;
    index: number;
    src: string;
    luminousity: number;
    failedImages: Record<string, number>;
    handleRetry: () => void;
    handleError: () => void;
    handleLoad: () => void;
};

const ScanLoaderImage = ({
    failedImages,
    id,
    src,
    index,
    luminousity,
    handleError,
    handleLoad,
    handleRetry,
}: ScanLoaderImageType) => {
    const version = failedImages[id] ?? 0;
    const imageUrl = `${src}${version > 0 ? `?v=${version}` : ""}`;

    return (
        <div className="relative">
            <img
                className="z-0 object-contain"
                key={index}
                src={imageUrl}
                alt={`Page ${id}`}
                onError={handleError}
                onLoad={handleLoad}
            />

            {!(id in failedImages) && (
                <div
                    style={{
                        backgroundColor: `rgba(0, 0, 0, ${(90 - luminousity) / 100
                            })`,
                    }}
                    className="absolute top-0 right-0 left-0 bottom-0 z-10"
                />
            )}

            {id in failedImages && (
                <div className="flex justify-center">
                    <button
                        className="cursor-pointer mt-2 mb-2 text-white underline"
                        onClick={handleRetry}
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
};

const ScanLoader = ({
    images,
    luminousity,
    pageLoading,
    setShowControls,
    setShowLightConfig,
}: ScanLoaderType) => {
    const [loading, setLoading] = useState(false);
    const [imagesQueue, setImagesQueue] = useState([...images]);
    const [loadedImages, setLoadedImages] = useState<ScanImage[]>([]);
    const [failedImages, setFailedImages] = useState<Record<string, number>>(
        {}
    );

    const handleError = (id: number) => {
        setFailedImages((prev) => ({ ...prev, [id]: prev[id] ?? 0 }));
    };

    const handleLoad = (id: number) => {
        setFailedImages((prev) => {
            const updated = { ...prev };
            delete updated[id];

            return updated;
        });
    };

    const handleRetry = (id: number) => {
        setFailedImages((prev) => ({
            ...prev,
            [id]: (prev[id] ?? 0) + 1, // increment version to force reload
        }));
    };

    useEffect(() => {
        if (pageLoading) {
            setLoadedImages([]);
            setFailedImages({});
            setLoading(false);
        }
    }, [pageLoading]);


    useEffect(() => {
        if (images.length > 0) {
            setImagesQueue([...images]);
            setLoadedImages([]);
        }
    }, [images]);

    useEffect(() => {
        if (!imagesQueue.length || loading) return;

        // const nextQueue = [...imagesQueue];
        // const nextImage = nextQueue.shift();

        const nextImage = imagesQueue[0];
        setLoading(true);

        // if (!nextImage) return;

        // setLoading(true);

        const img = new Image();
        img.onload = () => {
            const valideImage = imagesQueue.find(image => image.url == nextImage.url);

            if (valideImage) {
                setLoadedImages((prev) => [...prev, valideImage]);
                setImagesQueue(prev => prev.slice(1));
                setLoading(false);
            }
        };

        img.onerror = () => {
            const valideImage = imagesQueue.find(image => image.url == nextImage.url)

            if (valideImage) {
                setLoadedImages((prev) => [...prev, valideImage]);
                setImagesQueue(prev => prev.slice(1));
                setLoading(false);
            }
        };

        img.src = nextImage.url;
    }, [imagesQueue, loading]);

    return (
        <div
            className="z-10 w-full select-none"
            onClick={() => {
                setShowControls((prev) => !prev);
                setShowLightConfig(false);
            }}
        // onDoubleClick={() => setShowControls((prev) => !prev)}
        >
            {pageLoading ? (
                <div className="flex flex-col justify-center items-center h-screen w-screen overflow-y-hidden text-white">
                    <Loading loadingText="Chargement des données..." />
                </div>
            ) : (
                loadedImages
                    .sort((a, b) => a.id - b.id)
                    .filter(image => images.findIndex(img => img.url == image.url) != -1)
                    .map((image, index) => (
                        <ScanLoaderImage
                            key={image.id}
                            failedImages={failedImages}
                            handleError={() => handleError(image.id)}
                            handleLoad={() => handleLoad(image.id)}
                            handleRetry={() => handleRetry(image.id)}
                            id={image.id}
                            index={index}
                            luminousity={luminousity}
                            src={image.url}
                        />
                    ))
            )}

            {loading && !pageLoading && (
                <div className="flex gap-2 py-3 flex-col justify-center items-center overflow-y-hidden">
                    <Loading loadingText="Chargement..." className="h-6 w-6" />
                </div>
            )}
        </div>
    );
};
export default ScanLoader;
