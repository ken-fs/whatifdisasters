"use client";

import { useState } from "react";

/**
 * YouTube embed behind a click-to-play facade (styles: .video-facade in base.css).
 * Nothing third-party loads on first paint; youtube-nocookie avoids ad cookies
 * until the visitor actually asks for the video.
 */
export function VideoEmbed({ id, title, channel }: { id: string; title: string; channel: string }) {
  const [play, setPlay] = useState(false);
  return (
    <figure>
      <div className="tile relative aspect-video overflow-hidden">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button type="button" onClick={() => setPlay(true)} aria-label={`Play video: ${title}`} className="video-facade absolute inset-0 h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail; no image optimizer in a static export */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="play-btn absolute inset-0 flex items-center justify-center text-4xl" aria-hidden="true">
              ▶
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 text-xs text-ink-faint">
        {title} — {channel}. Embedded from YouTube; all credit to the creator.
      </figcaption>
    </figure>
  );
}
