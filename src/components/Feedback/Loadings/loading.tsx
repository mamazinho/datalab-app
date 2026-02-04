export const LoadingPiece = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            <h2 className="mt-3 text-orange-500 font-medium text-sm tracking-wider uppercase animate-pulse">Loading...</h2>
        </div>
    );
}