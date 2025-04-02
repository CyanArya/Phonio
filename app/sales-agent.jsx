import React from "react";
import VideoCall from "../components/VideoCall";

const SalesAgent = () => {
  return (
    <div>
      <h1>Sales Agent Page</h1>
      <VideoCall roomUrl="your_livekit_room_url_here" />
    </div>
  );
};

export default SalesAgent;