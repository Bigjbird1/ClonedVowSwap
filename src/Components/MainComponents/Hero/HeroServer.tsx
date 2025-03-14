"use server";

import HeroClient from "./HeroClient";

export default async function HeroServer() {
  // Wedding-themed video from Pexels
  const heroVideo =
    "https://videos.pexels.com/video-files/1722593/1722593-uhd_2560_1440_24fps.mp4";

  return (
    <div>
      <HeroClient heroVideo={heroVideo} />
    </div>
  );
}
