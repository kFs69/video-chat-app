import { useState, useEffect } from 'react';
import { socket } from './socket';
import Peer from 'peerjs';
import axios from 'axios';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState(window.location.pathname.split('/')[1] || '');
  const [peerId, setPeerId] = useState(null)
  const peer = new Peer();
  
  useEffect(() => {
    if(!window.location.pathname.split('/')[1]) {
      getRoomId();
      return;
    }
    
    const video = document.createElement('video');
    video.muted = true;

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStream(video, stream)

      peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement(video);
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

      socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
      })
    })

    peer.on('open', (id) => {
      socket.emit('join-room', roomId, id);
    })

    socket.emit('join-room', roomId, 10)

    socket.on('user-connected', (userId) => {
      console.log('User connected: ', userId)
    })
  }, [])

  async function getRoomId() {
    await axios.get('http://localhost:4000/')
      .then(function ({ data }) {
        window.location.href = `http://localhost:3000/${data.roomId}`
      })
  }

  function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
      video.remove();
    })
  }

  function addVideoStream(video, stream) {
    const videoGrid = document.getElementById('videoGrid');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    console.log(videoGrid)
    videoGrid.append(video);
  }

  return (
    <div id="videoGrid" />
  );
}

export default App;
