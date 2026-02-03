import { Link } from 'react-router-dom';
import { DatalabAPI } from '../../../services/datalab-api';
import { AsyncResource } from '../../../components/Tools/async-resource';
import type { IRetrieveChat } from '../../../services/datalab-api/chatsResource';


const ChatList = ({ chats }: { chats: IRetrieveChat[] }) => {
    if (!chats.length) return <div className="text-muted p-3">Nenhum chat encontrado.</div>;

    return (
        <div className="list-group">
            {chats.map(chat => (
                <div key={chat.id}>
                    <Link to={`/chats/${chat.id}/messages`} className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1">{chat.title}</h5>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export const AllChats = () => {
    return (
        <div className="mt-4">
            <h3>Chats Disponíveis</h3>
            <AsyncResource fetcher={DatalabAPI.ChatsResource.getAllChats}>
                {(data) => <ChatList chats={data} />}
            </AsyncResource>
        </div>
    );
}
