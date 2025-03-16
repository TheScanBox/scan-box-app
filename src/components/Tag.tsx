
type TagProps = {
    name: string
}

function Tag({ name }: TagProps) {
    return (
        <div className="p-1 px-2 rounded-full bg-red-400">
            <p className="text-white text-xs">{name}</p>
        </div>
    )
}

export default Tag