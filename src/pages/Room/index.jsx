import React from 'react';
import { useState, useEffect } from 'react';
import { socket } from '../../socket';
import { useParams, useNavigate } from 'react-router-dom';
import Peer from 'peerjs';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa'
import { ImPhoneHangUp } from 'react-icons/im'
import './styles.css';

function Room() {
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [audioTrack, setAudioTrack] = useState({});
  const [videoTrack, setVideoTrack] = useState({});
  let { roomId } = useParams();
  const navigate = useNavigate();

  const peer = new Peer();
  
  useEffect(() => {
    const video = document.createElement('video');
    video.muted = true;
    
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      const aTrack = stream.getAudioTracks();
      const vTrack = stream.getVideoTracks();

      if(aTrack.length) setAudioTrack(aTrack[0]);
      if(vTrack.length) setVideoTrack(vTrack[0]);

      addVideoStream(video, stream)

      peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

      socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
      })
    })

    socket.on('user-disconnected', userId => {
      if(peers[userId]) peers[userId].close();
    })

    peer.on('open', (id) => {
      socket.emit('join-room', roomId, id);
    })

    socket.on('user-connected', (userId) => {
      console.log('User connected: ', userId)
    })
  }, [])

  function muteMic() {
    if(audioTrack) {
      audioTrack.enabled = isMuted;
      setIsMuted(!isMuted)
    }
  }

  function disableCam() {
    if(videoTrack) {
      videoTrack.enabled = isCamOff;
      setIsCamOff(!isCamOff)
    }
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

    setPeers({...peers, [userId]: call})
  }

  function addVideoStream(video, stream) {
    const videoGrid = document.getElementById('videoGrid');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    videoGrid.append(video);
  }

  return (
    <div id="container">
      <div id="videoGrid" />

      <div id="mediaSettings">
        {isMuted ? 
          <FaMicrophoneSlash onClick={() => muteMic()} id="mediaIcon" /> 
          : <FaMicrophone onClick={() => muteMic()} id="mediaIcon" /> 
        }
        {isCamOff ? 
          <FaVideoSlash onClick={() => disableCam()} id="mediaIcon" /> 
          : <FaVideo onClick={() => disableCam()} id="mediaIcon" /> 
        }
        <ImPhoneHangUp onClick={() => navigate('/')} id="mediaIconHangUp" />
      </div>
    </div>

  )
}

export default Room;