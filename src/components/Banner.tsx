import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScanResponse } from "../App";

function Banner({ data }: { data: ScanResponse[] }) {
    const [index, setIndex] = useState(1);

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
                    <div className={`point ${index === idx && "active"}`} />
                ))}
            </div>

            <div
                className="h-full w-full rounded-lg bg-cover bg-center"
                style={{
                    backgroundImage: `url(${data[index].imgUrl})`,
                }}
            />
            {/* <img
                src={data[index].imgUrl}
                alt={data[index].title}
                className="h-full w-full object-cover rounded-lg"
            /> */}

            <div className="absolute bottom-0 p-2 text-white w-full flex justify-between items-center bg-black/50 rounded-b-lg">
                <div>
                    <h2 className="text-xl text-white capitalize">
                        {data[index].title}
                    </h2>
                    <p className="text-sm text-slate-200">{data[index].type}</p>
                </div>
                <div className="flex justify-center items-center w-20">
                    <Link
                        className="p-2 rounded-full bg-blue-500 w-full text-center"
                        to={`/details/${data[index].scanId}`}
                    >
                        Lire
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Banner;
