
const Poster = () => {
    return (
        <div className="mt-4 relative w-full">
            <img
                src="https://cdn.statically.io/gh/Anime-Sama/IMG/img/autres/banniere_saison_07-25_XL.jpg"
                alt=""
                className="w-full h-20 object-cover rounded-lg"
            />

            <div className="absolute top-0 left-0 w-full h-full bg-black/30 rounded-lg flex justify-end items-center px-3">
                <button className="bg-red-500 px-3 py-1.5 rounded-full text-white text-xs flex items-center gap-1">
                    View
                </button>
            </div>
        </div>
    )
}

export default Poster