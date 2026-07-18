export interface FeedItem {
  id: string;
  time: string;
  title: string;
  location: string;
  distanceKm: number;
  scared: string;
  comments: string;
  live?: boolean;
  description?: string;
}

export const phoneFeedItems: FeedItem[] = [
  {
    id: 'feed-1',
    time: 'Just now',
    distanceKm: 0.9,
    title: 'Snatching Attempt Near Market',
    location: 'Aminabad, Lucknow',
    description: 'Multiple SAFORA users report a man fleeing the scene on foot.',
    scared: '21k',
    comments: '2k',
    live: true,
  },
  {
    id: 'feed-2',
    time: 'Just now',
    distanceKm: 2,
    title: 'Elderly Man Reported Missing',
    location: 'Indira Nagar, Lucknow',
    scared: '128',
    comments: '12',
  },
];

export interface Story {
  id: string;
  emoji: string;
  label: string;
  colorClass: string;
}

export const stories: Story[] = [
  { id: 'story-1', emoji: '🚨', label: 'Snatcher Caught\non Camera', colorClass: 'bg-red-500/20' },
  { id: 'story-2', emoji: '🧒', label: 'Lost Child\nReunited Safely', colorClass: 'bg-blue-500/20' },
  { id: 'story-3', emoji: '🔥', label: 'Fire Crew Guided\nby Live Reports', colorClass: 'bg-amber-500/20' },
  { id: 'story-4', emoji: '🧳', label: 'Stranded Traveler\nFound Shelter', colorClass: 'bg-teal-500/20' },
  { id: 'story-5', emoji: '🚧', label: 'Driver Warned\nBefore Road Block', colorClass: 'bg-purple-500/20' },
];

export interface FeatureItem {
  id: string;
  iconColorClass: string;
  title: string;
  description: string;
}

export const features: FeatureItem[] = [
  {
    id: 'feature-notify',
    iconColorClass: 'text-amber bg-amber/10',
    title: 'Get Notified',
    description: "Receive push notifications when there's an incident nearby so you can avoid that area.",
  },
  {
    id: 'feature-report',
    iconColorClass: 'text-bluebrand bg-bluebrand/10',
    title: 'Report Live',
    description: "If you're nearby an incident unfolding, log a report to help others stay safe.",
  },
  {
    id: 'feature-search',
    iconColorClass: 'text-teal bg-teal/10',
    title: 'Search Incidents',
    description: "If there's commotion like police activity or road closures, pull up the app and instantly find out why.",
  },
];

export interface StoryDetail {
  id: string;
  iconColorClass: string;
  title: string;
  description: string;
}

export const storyDetails: StoryDetail[] = [
  {
    id: 'detail-watch',
    iconColorClass: 'text-redbrand bg-redbrand/10',
    title: 'Watch incidents unfold.',
    description: "Community reports show what's really happening, from different vantage points, for a clearer view of the situation.",
  },
  {
    id: 'detail-know',
    iconColorClass: 'text-amber bg-amber/10',
    title: 'Know instantly.',
    description: 'Speed matters for events like missing persons. SAFORA alerts can reach you well before official channels.',
  },
  {
    id: 'detail-report',
    iconColorClass: 'text-bluebrand bg-bluebrand/10',
    title: 'Report to help others.',
    description: 'Add details and updates so the next person walking that street knows exactly what to expect.',
  },
];

export interface GreaterGoodItem {
  id: string;
  iconColorClass: string;
  title: string;
  description: string;
}

export const greaterGoodItems: GreaterGoodItem[] = [
  {
    id: 'gg-hospitals',
    iconColorClass: 'text-amber bg-amber/10',
    title: 'Hospitals respond faster.',
    description: 'ER teams can prep operating rooms minutes before getting a call from EMTs, using live community reports.',
  },
  {
    id: 'gg-transparency',
    iconColorClass: 'text-green-400 bg-green-400/10',
    title: 'Transparency between city and residents.',
    description: 'Real-time, open information helps everyone make smarter decisions about staying safe.',
  },
  {
    id: 'gg-access',
    iconColorClass: 'text-bluebrand bg-bluebrand/10',
    title: 'Equal access for everyone.',
    description: 'Residents and law enforcement see the same unbiased information — SAFORA stays independent.',
  },
];

/** Real, freely-licensed Unsplash photos — verified via web_fetch before use. */
export const photos = {
  verifiedAlertsHero:
    'https://images.unsplash.com/photo-1759299634586-6781b39edf11?fm=jpg&q=80&w=2000&auto=format&fit=crop',
  liveVideoMock:
    'https://images.unsplash.com/photo-1676402519309-0cedfe0771a4?fm=jpg&q=80&w=900&auto=format&fit=crop',
  greaterGoodHero:
    'https://images.unsplash.com/photo-1516841273335-e39b37888115?fm=jpg&q=80&w=2000&auto=format&fit=crop',
};
