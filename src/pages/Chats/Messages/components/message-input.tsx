interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isDisabled: boolean;
}

export const MessageInput = ({ value, onChange, onSubmit, isLoading, isDisabled }: MessageInputProps) => {
    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm"
        >
            <div className="flex gap-2">
                <div className="flex-1">
                    <input
                        id="prompt-input"
                        name="prompt"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={isDisabled}
                        autoComplete="off"
                        placeholder="Digite sua mensagem aqui..."
                        required
                    />
                </div>
                <button
                    className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center min-w-25"
                    type="submit"
                        disabled={isDisabled || !value.trim()}
                >
                    {isLoading ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" role="status" aria-hidden="true"></span>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <span className="mr-2">➤</span>
                            Enviar
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
