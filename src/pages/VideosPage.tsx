// src/pages/VideosPage.tsx - Video evidence gallery page
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Filter, Play, Calendar, Clock, Tag, ExternalLink } from 'lucide-react';
import YouTubePlayer from '@/components/YouTubePlayer';
import {
  videos,
  categoryLabels,
  categoryDescriptions,
  getVideosByCategory,
  getUploadedVideos,
  VideoCategory,
  VideoItem
} from '@/data/videos';

const VideosPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Get videos that have been uploaded (have real YouTube IDs)
  const uploadedVideos = useMemo(() => getUploadedVideos(), []);

  // Filter videos by category
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'all') {
      return uploadedVideos;
    }
    return getVideosByCategory(selectedCategory);
  }, [selectedCategory, uploadedVideos]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: uploadedVideos.length };
    uploadedVideos.forEach(video => {
      counts[video.category] = (counts[video.category] || 0) + 1;
    });
    return counts;
  }, [uploadedVideos]);

  // Category colors
  const categoryColors: Record<VideoCategory, string> = {
    'copyright-audit': 'purple',
    'prompt-audit': 'blue',
    'network-interference': 'red',
    'targeting-proof': 'orange',
    'chat-deletion': 'rose',
    'other': 'gray'
  };

  const getCategoryColorClasses = (category: VideoCategory) => {
    const colors = {
      'copyright-audit': 'bg-secondary text-foreground/85 border border-border',
      'prompt-audit': 'bg-secondary text-foreground/85 border border-border',
      'network-interference': 'bg-secondary text-foreground/85 border border-border border-l-2 border-l-destructive',
      'targeting-proof': 'bg-secondary text-foreground/85 border border-border',
      'chat-deletion': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'other': 'bg-gray-500/20 text-muted-foreground border-gray-500/30'
    };
    return colors[category] || colors['other'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground/80 hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-secondary border border-border border-l-2 border-l-destructive">
              <Video className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-foreground">Video Evidence</h1>
              <p className="text-muted-foreground/80">Screen recordings documenting AI system behavior and targeting</p>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-black'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
              }`}
            >
              All Videos ({categoryCounts['all'] || 0})
            </button>
            {(Object.keys(categoryLabels) as VideoCategory[]).map(category => (
              categoryCounts[category] > 0 && (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? getCategoryColorClasses(category).replace('/20', '/40').replace('/30', '/50')
                      : `${getCategoryColorClasses(category)} hover:opacity-80`
                  }`}
                >
                  {categoryLabels[category]} ({categoryCounts[category] || 0})
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Selected video player */}
        {selectedVideo && (
          <div className="mb-12 bg-gray-900/50 rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedVideo.exhibitNumber && (
                  <span className="px-3 py-1 bg-muted text-foreground/85 text-sm font-mono rounded border border-border">
                    {selectedVideo.exhibitNumber}
                  </span>
                )}
                <span className={`px-3 py-1 text-sm rounded border ${getCategoryColorClasses(selectedVideo.category)}`}>
                  {categoryLabels[selectedVideo.category]}
                </span>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-muted-foreground/80 hover:text-foreground transition-colors text-sm"
              >
                Close Player
              </button>
            </div>
            <YouTubePlayer
              videoId={selectedVideo.youtubeId}
              title={selectedVideo.title}
              description={selectedVideo.description}
              autoplay={true}
            />
          </div>
        )}

        {/* Video grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-muted-foreground/70 mx-auto mb-4" />
            <h2 className="text-xl text-muted-foreground/80 mb-2">No Videos Available Yet</h2>
            <p className="text-muted-foreground/70 max-w-md mx-auto">
              Video evidence will be displayed here once YouTube video IDs are added to the system.
              Screen recordings are being processed for upload.
            </p>
          </div>
        ) : (
          <>
            {/* Category description */}
            {selectedCategory !== 'all' && (
              <div className="mb-8 p-4 rounded-lg bg-gray-900/50 border border-border">
                <p className="text-muted-foreground">{categoryDescriptions[selectedCategory]}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-900/50 rounded-xl overflow-hidden border border-border hover:border-border transition-all group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 group-hover:bg-red-500 flex items-center justify-center transition-all group-hover:scale-110">
                        <Play className="w-7 h-7 text-foreground ml-1" fill="white" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-card rounded text-xs text-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-foreground font-medium line-clamp-2 group-hover:text-red-300 transition-colors">
                        {video.title}
                      </h3>
                      {video.exhibitNumber && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs font-mono rounded shrink-0">
                          {video.exhibitNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground/80 text-sm line-clamp-2 mb-3">
                      {video.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded border ${getCategoryColorClasses(video.category)}`}>
                        {categoryLabels[video.category]}
                      </span>
                      <span className="text-muted-foreground/70 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(video.date)}
                      </span>
                    </div>

                    {/* Tags */}
                    {video.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {video.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-secondary/40 text-muted-foreground/70 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {video.tags.length > 3 && (
                          <span className="px-2 py-0.5 text-muted-foreground/70 text-xs">
                            +{video.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info banner for pending uploads */}
        {uploadedVideos.length === 0 && (
          <div className="mt-8 p-6 rounded-xl bg-secondary/60 border border-border">
            <h3 className="text-blue-300 font-medium mb-2">Video Upload Pending</h3>
            <p className="text-blue-200/70 text-sm">
              {videos.length} screen recordings are queued for upload to YouTube. Once uploaded,
              they will be displayed here organized by category with full playback capability.
            </p>
            <ul className="mt-4 text-sm text-blue-200/60 space-y-1">
              <li>• Copyright Audits: {videos.filter(v => v.category === 'copyright-audit').length} videos</li>
              <li>• Prompt Audits: {videos.filter(v => v.category === 'prompt-audit').length} videos</li>
              <li>• User Targeting Proof: {videos.filter(v => v.category === 'targeting-proof').length} videos</li>
              <li>• Network Interference: {videos.filter(v => v.category === 'network-interference').length} videos</li>
              <li>• Chat Deletion Evidence: {videos.filter(v => v.category === 'chat-deletion').length} videos</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;
