import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScanResponse } from "../App";

function Banner({ data }: { data: ScanResponse[] }) {
    const [index, setIndex] = useState(0);

    const updateIndex = () => {
        setIndex((prevIndex) => {
            const computedIndex = prevIndex + 1;

            if (computedIndex >= data.length) {
                return 0;
            }

            return computedIndex;
        });
    };

    useEffect(() => {
        const intervalID = setInterval(() => {
            updateIndex();
        }, 3000);

        return () => clearInterval(intervalID);
    }, []);

    return (
        <div
            onClick={updateIndex}
            className="w-full h-48 lg:h-64 bg-slate-500 mt-4 rounded-lg relative"
        >
            <div className="flex gap-1 absolute top-2 right-1 p-2">
                {data.map((_, idx) => (
                    <div
                        key={idx}
                        className={`point ${index === idx && "active"}`}
                    />
                ))}
            </div>

            <div
                className="h-full w-full rounded-lg bg-cover bg-center"
                style={{
                    backgroundImage: `url(${data[index].imgUrl})`,
                }}
            />

            <div className="absolute bottom-0 p-2 text-white w-full flex gap-2 justify-between items-center bg-black/50 rounded-b-lg">
                <div className="w-3/4">
                    <h2 className="text-xl text-white capitalize truncate ">
                        {data[index].title}
                    </h2>
                    <p className="text-xs text-slate-200">{data[index].type}</p>
                </div>
                <div className="flex flex-1 justify-center items-center w-1/4">
                    <Link
                        className="p-2 rounded-full bg-blue-500 w-full text-center"
                        to={`/details/${data[index].scanId}/${data[index].scanParentId}`}
                    >
                        Lire
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Banner;
