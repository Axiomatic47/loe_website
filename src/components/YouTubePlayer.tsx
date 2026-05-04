// src/components/YouTubePlayer.tsx - YouTube video embed component
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, Maximize2, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  className?: string;
  autoplay?: boolean;
  showInfo?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  description,
  className,
  autoplay = false,
  showInfo = true,
  aspectRatio = '16:9'
}) => {
  const [isLoaded, setIsLoaded] = useState(autoplay);

  const aspectRatioClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square'
  }[aspectRatio];

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const autoplayParam = isLoaded ? '1' : '0';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=${autoplayParam}`;

  const handlePlay = () => {
    setIsLoaded(true);
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Video Container */}
      <div className={cn(
        "relative w-full rounded-lg overflow-hidden bg-black",
        aspectRatioClass
      )} style={{ minHeight: '360px' }}>
        {!isLoaded ? (
          // Thumbnail with play button
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={handlePlay}
          >
            <img
              src={thumbnailUrl}
              alt={title || 'Video thumbnail'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to lower quality thumbnail if maxres doesn't exist
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500
                            flex items-center justify-center transition-all
                            group-hover:scale-110 shadow-lg">
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              </div>
            </div>

            {/* Title overlay */}
            {title && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-medium text-lg line-clamp-1">{title}</h3>
              </div>
            )}
          </div>
        ) : (
          // YouTube iframe - use key to force re-render on video change
          <iframe
            key={videoId}
            src={embedUrl}
            title={title || 'YouTube video'}
            className="absolute inset-0 w-full h-full border-0"
            style={{ width: '100%', height: '100%' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {/* Info section */}
      {showInfo && (title || description) && (
        <div className="mt-4">
          {title && !isLoaded && (
            <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={openInYouTube}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in YouTube
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for embedding in other pages
export const YouTubeEmbed: React.FC<{ videoId: string; className?: string }> = ({
  videoId,
  className
}) => {
  return (
    <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="YouTube video"
        className="absolute inset-0 w-full h-full border-0"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubePlayer;
