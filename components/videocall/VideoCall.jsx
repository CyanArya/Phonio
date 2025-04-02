"use client"; // Ensure this file runs in the client

import React, { useEffect, useRef, useState } from "react";
import { Room, Track } from "livekit-client";
import styles from "./VideoCall.module.css"; // Make sure the CSS file exists

const VideoCall = ({ onClose }) => {
  const videoContainer = useRef(null);
  const [room, setRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const joinRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Generate a random room name if not provided
        const generatedRoomName = roomName || `room-${Math.random().toString(36).substring(7)}`;
        const participantName = `user-${Math.random().toString(36).substring(7)}`;

        console.log('Connecting to room:', generatedRoomName);
        console.log('Participant name:', participantName);

        // Get token from our API
        const response = await fetch('/api/livekit-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: generatedRoomName,
            participantName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get token');
        }

        const { token } = await response.json();
        console.log('Token received:', token.substring(0, 20) + '...');

        // Connect to LiveKit room
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        console.log('Connecting to LiveKit URL:', process.env.NEXT_PUBLIC_LIVEKIT_URL);
        await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, token);
        console.log('Connected to room successfully');
        
        setRoom(newRoom);
        setRoomName(generatedRoomName);

        // Enable camera & microphone
        await newRoom.localParticipant.setCameraEnabled(true);
        await newRoom.localParticipant.setMicrophoneEnabled(true);

        // Attach local video track
        newRoom.localParticipant.videoTracks.forEach((trackPublication) => {
          if (trackPublication.track) {
            trackPublication.track.attach(videoContainer.current);
          }
        });

        // Handle remote participants
        newRoom.on('participantConnected', (participant) => {
          console.log('Participant connected:', participant.identity);
          participant.videoTracks.forEach((trackPublication) => {
            if (trackPublication.track) {
              trackPublication.track.attach(videoContainer.current);
            }
          });
          setParticipantCount(prev => prev + 1);
        });

        newRoom.on('participantDisconnected', (participant) => {
          console.log('Participant disconnected:', participant.identity);
          setParticipantCount(prev => Math.max(1, prev - 1));
        });

        setIsConnecting(false);
      } catch (error) {
        console.error("Error connecting to room:", error);
        setError(error.message);
        setIsConnecting(false);
      }
    };

    joinRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  const handleClose = () => {
    if (room) {
      room.disconnect();
    }
    onClose();
  };

  const handleShareRoom = () => {
    const shareUrl = `${window.location.origin}?room=${roomName}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareDialog(true);
    setTimeout(() => setShowShareDialog(false), 2000);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest(`.${styles.controls}`)) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div className={styles["video-call-wrapper"]}>
      <div 
        className={styles["video-popup"]}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {isConnecting ? (
          <div className={styles["loading"]}>Connecting to call...</div>
        ) : error ? (
          <div className={styles["error"]}>
            Error: {error}
            <button onClick={handleClose}>Close</button>
          </div>
        ) : (
          <>
            <div ref={videoContainer} className={styles["video-container"]}></div>
            <div className={styles["participant-count"]}>
              {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
            </div>
            <div className={styles["controls"]}>
              <button className={styles["share-btn"]} onClick={handleShareRoom}>
                Share Room
              </button>
              <button className={styles["close-btn"]} onClick={handleClose}>
                Close
              </button>
            </div>
            {showShareDialog && (
              <div className={styles["share-dialog"]}>
                Room link copied to clipboard!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
