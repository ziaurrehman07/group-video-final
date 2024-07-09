import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Callroom = () => {
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [isCaller, setIsCaller] = useState(false);

  useEffect(() => {
    socket.on("offer", async (data) => {
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current.srcObject = localStream;
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { answer });
    });

    socket.on("answer", async (data) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    });

    socket.on("candidate", async (data) => {
      if (data.candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
    };
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current.srcObject = event.streams[0];
    };

    return pc;
  };

  const startCall = async () => {
    setIsCaller(true);
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    localStreamRef.current.srcObject = localStream;

    const pc = createPeerConnection();
    peerConnectionRef.current = pc;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", { offer });
  };

  return (
    <div>
      <h1>Voice Call</h1>
      <button onClick={startCall}>Start Call</button>
      <audio ref={localStreamRef} autoPlay muted></audio>
      <audio ref={remoteStreamRef} autoPlay></audio>
    </div>
  );
};

export default Callroom;
