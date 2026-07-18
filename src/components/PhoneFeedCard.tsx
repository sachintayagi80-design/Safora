import type { FeedItem } from '@/data/content';

interface PhoneFeedCardProps {
  item: FeedItem;
}

export default function PhoneFeedCard({ item }: PhoneFeedCardProps) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        {item.live && (
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 6px #ef4444' }} />
        )}
        <span>
          {item.time} · {item.distanceKm} km
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white leading-snug">{item.title}</p>
      <p className="mt-0.5 text-xs text-gray-400">{item.location}</p>

      {item.live && (
        <div className="relative mt-3 flex h-20 items-center justify-center rounded-lg bg-black/40">
          <span className="absolute left-2 top-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            ● LIVE
          </span>
        </div>
      )}

      {item.description && <p className="mt-3 text-xs leading-relaxed text-gray-300">{item.description}</p>}

      <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-400">
        <span>😟 {item.scared}</span>
        <span>💬 {item.comments}</span>
        <span className="ml-auto font-semibold tracking-wide text-gray-300">↗ SHARE</span>
      </div>
    </div>
  );
}
