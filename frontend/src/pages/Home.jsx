import React, { useState, useRef } from "react";
import "./Home.css";
import MatrixBackground from "../components/MatrixBackground";
import { v4 as uuidv4 } from "uuid";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const createNewRoom = () => {
        try {
            const id = uuidv4();
            setRoomId(id);

            inputRef.current.focus();

            toast.success("Room created!");
        } catch (err) {
            toast.error("Something went wrong");
            console.log(err);
        }
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error("Room Id and Username is required");
            return;
        }

        //Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });

    }

    const handleEnter = (e) =>{
        if(e.code == 'Enter'){
            joinRoom();
        }
    }

    return (
        <>
            <MatrixBackground />

            <div className="homePageWrapper">
                <div className="formWrapper">
                    <h4 className="mainLabel">Paste invitation ROOM ID</h4>

                    <div className="inputGroup">
                        <input
                            ref={inputRef}
                            type="text"
                            className="inputBox"
                            placeholder="ROOM ID"
                            value={roomId}
                            onChange={(e) => {
                                setRoomId(e.target.value);
                            }}
                            onKeyUp={handleEnter}
                        />

                        <input
                            type="text"
                            className="inputBox"
                            placeholder="USER NAME"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyUp={handleEnter}
                        />

                        <button className="btn joinBtn" onClick={joinRoom}>Join</button>

                        <span className="CreateInfo">
                            If you don't have an invite code then create &nbsp;
                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    createNewRoom();
                                }}
                                className="createNewBtn"
                            >
                                new room
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;