import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const useStompClient = (url: string) => {
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(url),
            onConnect: () => {
                console.log("Connected to WebSocket");
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, [url]);

    return client;
};

export default useStompClient; // Ensure default OR named export depending on usage