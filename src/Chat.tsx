import { Message, Player } from "./schema/MyRoomState"
import { FormEvent, useEffect, useRef, useState } from "react";

export default (props: {players: Player[], sendMessage: (text: string) => void, messages: Message[]}) => {
    const [text,setText] = useState("");
    const messages = useRef<HTMLDivElement>(null);

    const sendMessage = (event: FormEvent) => {
        event.preventDefault();
        if (text.length > 0) {
            props.sendMessage(text);
            setText("");
        }
    }


    useEffect(() => {
        messages.current.scrollTop = messages.current.scrollHeight;
    }, [props.messages.length])

    return <div id="left-panel">
        <div id="online-players">
            <h3 id="player-count">Online Players: {props.players.length}</h3>
            {
            props.players.map(player =><div key={player.id} className="player-name" style={{color: `rgb(${player.color.r * 255},${player.color.g * 255},${player.color.b * 255})`}}>{player.name}</div>)
            }
        </div>
        <div className="hr"/>
        <div id="chat">
            <div id="messages" ref={messages}>
            <h3>Chat</h3>
                {props.messages.map(message => <div className="message"><span className="player-name" style={{color: `rgb(${message.color.r * 255},${message.color.g * 255},${message.color.b * 255})` }}>{message.name}</span><span>{message.message}</span></div>)}
            </div>
            <form id="chatbox" onSubmit={sendMessage}>
                <input autoComplete="off" type="text" value={text} onChange={(ev) => setText(ev.target.value)}/>
                <button>Send</button>
            </form>
        </div>
    </div>
}