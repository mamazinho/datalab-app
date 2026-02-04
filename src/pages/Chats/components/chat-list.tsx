import { Link } from 'react-router-dom';
import type { IRetrieveChat } from '../../../services/datalab-api/chatsResource';


export const ChatList = ({ chats }: { chats: IRetrieveChat[] }) => {
    if (!chats.length) return <div className="text-gray-500 italic p-8 text-center bg-gray-50 rounded-xl border border-gray-200">Nenhum chat encontrado.</div>;

    return (
        <div className="flex flex-col gap-3">
            {chats.map(chat => (
                <div key={chat.id}>
                    <Link to={`/chats/${chat.id}/messages`} className="block group">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm hover:shadow-md cursor-pointer">
                            <h5 className="font-semibold text-gray-800 group-hover:text-orange-700 transition-colors m-0 text-lg">{chat.title}</h5>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};
