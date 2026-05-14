import React, { useState, useRef, useEffect } from 'react'
import logo from "../assets/logo.png";
import Client from '../components/Client';
import Editor from '../components/Editor';
import './EditorPage.css';
import { initSocket } from '../socket'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import ACTIONS from '../../../shared/Actions.Frontend.js';
import toast from 'react-hot-toast';


const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigater = useNavigate();

  const [connected, setConnected] = useState([])

  useEffect(() => {
    let socket;

    const init = async () => {
      socket = await initSocket();
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });
      });

      //Listening for JOINED event
      socket.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room`);
          console.log(`${username} joined`);
        }
        setConnected(clients);
      })

      //Listening to disconnected
      socket.on(ACTIONS.DISCONNECTED,({socketId,username})=>{
        toast.success(`${username} left the room`);
        setConnected((prev)=>{
          return prev.filter(
            (client)=> client.socketId !== socketId
          )
        })
      })

    };

    init();

    return () => {
      if (socket) {
        socket.disconnect();
        socket.off();
      }
    };
  }, [roomId]);

  async function copyRoomId(){
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success('room Id has been copied to your clipboard');
    }catch(err){
      toast.error("room Id can't be copied");
      console.log(err);
    }
  }

  async function leaveRoom() {
    reactNavigater('/');
  }



  return (
    <div className='mainWrap'>
      <div className='lSide'>
        <div className="lSideInner">
          <div className="logo">
            <img className='logoImage' src={logo} alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="connected">
            {
              connected.map((i) => (
                <Client
                  key={i.socketId}
                  username={i.username}
                />
              ))
            }
          </div>
        </div>
        <div className="btnGroup">
          <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button>
          <button className='btn leaveBtn' onClick={leaveRoom}>Leave Room</button>
        </div>

      </div>
      <div className='mainSide'>
        <Editor socketRef={socketRef} roomId={roomId}/>
      </div>
    </div>
  )
}

export default EditorPage
