// src/data/videos.ts - Video metadata for YouTube embeds
// Replace 'YOUTUBE_VIDEO_ID' placeholders with actual YouTube video IDs after uploading

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: VideoCategory;
  exhibitNumber?: string;
  date: string;
  duration?: string;
  tags: string[];
}

export type VideoCategory =
  | 'copyright-audit'
  | 'prompt-audit'
  | 'network-interference'
  | 'targeting-proof'
  | 'chat-deletion'
  | 'other';

export const categoryLabels: Record<VideoCategory, string> = {
  'copyright-audit': 'Copyright Audits',
  'prompt-audit': 'Prompt Audits',
  'network-interference': 'Network Interference',
  'targeting-proof': 'User Targeting Proof',
  'chat-deletion': 'Chat Deletion Evidence',
  'other': 'Other Evidence'
};

export const categoryDescriptions: Record<VideoCategory, string> = {
  'copyright-audit': 'Screen recordings demonstrating AI systems extracting full copyrighted lyrics',
  'prompt-audit': 'Evidence of system prompt manipulation and Constitutional AI bypass',
  'network-interference': 'Documentation of network-level attacks and interference',
  'targeting-proof': 'Proof of user-specific targeting through MAC spoofing and VPN changes',
  'chat-deletion': 'Evidence of backend chat deletion and data manipulation',
  'other': 'Additional documentary evidence'
};

// Video data - Replace YOUTUBE_VIDEO_ID with actual IDs after uploading
export const videos: VideoItem[] = [
  // Copyright Audits
  {
    id: 'rec-5',
    youtubeId: 'LUzXKR4QD6s',
    title: 'Anthropic Copyright Audit 1, Oct. 29, 2025',
    description: 'Screen recording demonstrating full lyrical extraction from Claude AI, showing systematic extraction of copyrighted song lyrics.',
    category: 'copyright-audit',
    exhibitNumber: 'REC-5',
    date: '2025-10-29',
    tags: ['copyright', 'lyrics', 'claude', 'extraction']
  },
  {
    id: 'rec-6',
    youtubeId: 'J4xlVt10JAc',
    title: 'Anthropic Copyright Audit 2, Oct. 29, 2025',
    description: 'Comprehensive documentation of Claude AI completing full copyrighted lyrics when prompted, demonstrating the systemic nature of copyright infringement capabilities.',
    category: 'copyright-audit',
    exhibitNumber: 'REC-6',
    date: '2025-10-29',
    tags: ['copyright', 'lyrics', 'claude', 'full-extraction']
  },
  {
    id: 'rec-7',
    youtubeId: 'HEojLFvqXPc',
    title: 'Opus CR Audit with IP Notice Injection - Chevelle In The Red',
    description: 'Copyright audit demonstrating full lyrical extraction from Claude Opus with IP notice injection for Chevelle\'s "In The Red".',
    category: 'copyright-audit',
    exhibitNumber: 'REC-7',
    date: '2025-12-05',
    tags: ['copyright', 'lyrics', 'claude', 'opus', 'chevelle', 'ip-notice']
  },
  {
    id: 'rec-12',
    youtubeId: 'YOUTUBE_VIDEO_ID', // Replace after upload
    title: 'Copyright Audit Output Redaction',
    description: 'Screen recording documenting real-time output redaction during a Claude copyright audit session.',
    category: 'copyright-audit',
    exhibitNumber: 'REC-12',
    date: '2026-02-16',
    tags: ['copyright', 'audit', 'output-redaction']
  },

  // Prompt Audits
  {
    id: 'rec-10',
    youtubeId: 'CH4EqVP8UIo',
    title: 'Claude Prompt Audit Demonstrating Syntactic Execution and Tag Bypass',
    description: 'Demonstration of syntactic execution vulnerabilities and system tag bypass in Claude AI, showing how the Constitutional AI framework can be circumvented.',
    category: 'prompt-audit',
    exhibitNumber: 'REC-10',
    date: '2025-11-28',
    tags: ['prompt', 'bypass', 'syntactic', 'constitutional-ai']
  },
  {
    id: 'rec-11',
    youtubeId: '8hkhgqR_kYg',
    title: 'November 13 Prompt Audit',
    description: 'Comprehensive prompt audit session documenting system prompt behavior and response patterns.',
    category: 'prompt-audit',
    exhibitNumber: 'REC-11',
    date: '2025-11-13',
    tags: ['prompt', 'audit', 'system-prompt']
  },

  // User Targeting Proof
  {
    id: 'rec-1',
    youtubeId: 'y8X3NanfLVU',
    title: 'MAC Address Spoofing to Bypass and Prove Anthropic User-Specific Targeting',
    description: 'Technical demonstration using MAC address spoofing to prove that Anthropic implements user-specific targeting at the device level, bypassing standard authentication.',
    category: 'targeting-proof',
    exhibitNumber: 'REC-1',
    date: '2025-12-08',
    tags: ['targeting', 'mac-spoofing', 'anthropic', 'device-fingerprint']
  },
  {
    id: 'rec-2',
    youtubeId: 'PBEdAP12jUw',
    title: 'Incognito Bondi Targeting Memo Experiment Proving Constitutional AI Bypass',
    description: 'Experiment proving Constitutional AI bypass through incognito mode, demonstrating that targeting persists across browser sessions and proves coordinated surveillance.',
    category: 'targeting-proof',
    exhibitNumber: 'REC-2',
    date: '2025-12-07',
    tags: ['targeting', 'incognito', 'bondi', 'constitutional-ai']
  },
  {
    id: 'rec-3',
    youtubeId: 'gvgBnPMJIkE',
    title: 'Incognito Bondi Targeting Memo Second Reproduction',
    description: 'Second reproduction of the Bondi targeting memo experiment, confirming the reproducibility of the Constitutional AI bypass.',
    category: 'targeting-proof',
    exhibitNumber: 'REC-3',
    date: '2025-12-07',
    tags: ['targeting', 'incognito', 'reproduction', 'bondi']
  },
  {
    id: 'rec-4',
    youtubeId: 'epUTQaYgAnM',
    title: 'VPN Change to Bypass and Prove Anthropic User-Specific Targeting',
    description: 'Demonstration using VPN IP changes to prove user-specific targeting persists across network changes, indicating deep fingerprinting beyond IP address.',
    category: 'targeting-proof',
    exhibitNumber: 'REC-4',
    date: '2025-12-06',
    tags: ['targeting', 'vpn', 'fingerprinting', 'ip-change']
  },

  // Chat Deletion
  {
    id: 'rec-9',
    youtubeId: 'O310fBRDpQI',
    title: 'Chat Deletion During Interference Recording BC Logs',
    description: 'Screen recording capturing real-time chat deletion during network interference documentation, showing evidence destruction.',
    category: 'chat-deletion',
    exhibitNumber: 'REC-9',
    date: '2025-11-14',
    tags: ['chat-deletion', 'interference', 'evidence-destruction', 'bc-logs']
  },
  {
    id: 'rec-13',
    youtubeId: 'Yz9o64JBypQ',
    title: 'Backend Chat Deletion',
    description: 'Documentation of backend chat deletion, showing systematic removal of conversation history without user action.',
    category: 'chat-deletion',
    exhibitNumber: 'REC-13',
    date: '2025-11-13',
    tags: ['chat-deletion', 'backend', 'systematic']
  },

  // Other Evidence
  {
    id: 'rec-14',
    youtubeId: 'YOUTUBE_VIDEO_ID', // Replace after upload
    title: 'Anthropic "Keep Thinking with Claude" Brand Campaign',
    description: 'Screen recording of Anthropic\'s "Keep Thinking with Claude" brand campaign materials, dated September 18, 2025.',
    category: 'other',
    exhibitNumber: 'REC-14',
    date: '2025-09-18',
    tags: ['anthropic', 'brand-campaign', 'keep-thinking']
  },

  // Lyrical Screenshot Videos (for Copyright Notifications page)
  {
    id: 'lyrical-1',
    youtubeId: 'YOUTUBE_VIDEO_ID', // Replace after upload
    title: 'Lyrical Extraction Screen Recording - Session 1',
    description: 'Screen recording from October 29, 2025 documenting the process of extracting copyrighted lyrics from AI systems.',
    category: 'copyright-audit',
    date: '2025-10-29',
    tags: ['copyright', 'lyrics', 'screen-recording']
  },
  {
    id: 'lyrical-2',
    youtubeId: 'YOUTUBE_VIDEO_ID', // Replace after upload
    title: 'Lyrical Extraction Screen Recording - Session 2',
    description: 'Second screen recording session from October 29, 2025 continuing documentation of lyrical extraction.',
    category: 'copyright-audit',
    date: '2025-10-29',
    tags: ['copyright', 'lyrics', 'screen-recording']
  }
];

// Helper functions
export const getVideosByCategory = (category: VideoCategory): VideoItem[] => {
  return videos.filter(v => v.youtubeId !== 'YOUTUBE_VIDEO_ID' && v.category === category);
};

export const getAllCategories = (): VideoCategory[] => {
  const categories = new Set(videos.map(v => v.category));
  return Array.from(categories);
};

export const getVideoById = (id: string): VideoItem | undefined => {
  return videos.find(v => v.id === id);
};

export const getVideoByExhibit = (exhibitNumber: string): VideoItem | undefined => {
  return videos.find(v => v.exhibitNumber === exhibitNumber);
};

// Get only videos that have been uploaded (have real YouTube IDs)
export const getUploadedVideos = (): VideoItem[] => {
  return videos.filter(v => v.youtubeId !== 'YOUTUBE_VIDEO_ID');
};

export const getCopyrightVideos = (): VideoItem[] => {
  return videos.filter(v =>
    v.youtubeId !== 'YOUTUBE_VIDEO_ID' &&
    v.category === 'copyright-audit'
  );
};
