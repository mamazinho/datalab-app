import { useState } from 'react';
import { DatalabAPI } from '../../../services/datalab-api';
import { type ICreateChat } from '../../../services/datalab-api/chatsResource';

export const CreateChat = () => {
    const [toCreateChat, setToCreateChat] = useState(false);
    const [chatPayload, setChatPayload] = useState<ICreateChat>();

    const createChat = (payload?: ICreateChat) => {
        if (!payload) throw new Error("Payload is required");
        DatalabAPI.ChatsResource.createChat(payload).then(data => {
            setChatPayload(data);
        });
    };

    const handleCreateChat = () => {
        createChat(chatPayload);
        setToCreateChat(false);
        setChatPayload(undefined);
    }

    return (
        <div>
            <button className="btn btn-primary" onClick={() => setToCreateChat(!toCreateChat)}>Create Chat</button>
            {toCreateChat && (
                <div>
                    <input
                        type="text"
                        value={chatPayload?.title}
                        onChange={e => setChatPayload({ title: e.target.value })}
                        placeholder="Chat Title"
                    />
                    <button type="submit" onClick={handleCreateChat}>Create</button>
                </div>
            )}
        </div>
    );
}