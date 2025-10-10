import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DatalabAPI, type IRetrieveChat } from '../../services/datalab-api';

export const AllChats = () => {
    const [chats, setChats] = useState<IRetrieveChat[]>([]);

    const fetchChats = () => {
        DatalabAPI.getAllChats().then(data => {
            setChats(data);
        });
    };

    useEffect(() => {
        fetchChats();
    }, []);

    return (
        <div className="mt-4">
            <h3>Chats Disponíveis</h3>
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
        </div>
    );
}