// src/CallRoom.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const socket = io("http://localhost:5000");

const CallRoom = () => {
  const [peers, setPeers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const userVideo = useRef();
  const peersRef = useRef([]);
  const userStream = useRef();

  useEffect(() => {
    socket.emit("join", "room1");

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        userStream.current = stream;
        userVideo.current.srcObject = stream;
        socket.on("new-user", (userId) => {
          const peer = createPeer(userId, socket.id, stream);
          peersRef.current.push({
            peerID: userId,
            peer,
          });
          setPeers((users) => [...users, peer]);
        });

        socket.on("signal", (data) => {
          const item = peersRef.current.find((p) => p.peerID === data.from);
          item.peer.signal(data.signal);
        });
      });

    return () => {
      socket.emit("leave", "room1");
      socket.disconnect();
    };
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", {
        signal,
        to: userToSignal,
        from: callerID,
        room: "room1",
      });
    });

    return peer;
  }

  const toggleMute = () => {
    const enabled = userStream.current.getAudioTracks()[0].enabled;
    userStream.current.getAudioTracks()[0].enabled = !enabled;
    setIsMuted(!enabled);
  };

  return (
    <div>
      <audio ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => (
        <Audio key={index} peer={peer} />
      ))}
      <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
    </div>
  );
};

const Audio = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <audio ref={ref} autoPlay playsInline />;
};

export default CallRoom;
