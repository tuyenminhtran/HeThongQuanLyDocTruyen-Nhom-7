import { Link } from "react-router-dom";
import type { StoryListItem } from "../api/stories";

const accessBadges: Record<number, { label: string; className: string }> = {
  0: {
    label: "Miễn phí",
    className: "bg-emerald-500/90 text-white border-emerald-400/30",
  },
  1: {
    label: "VIP",
    className: "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-sm shadow-amber-500/20 border-amber-300/40",
  },
  2: {
    label: "Hỗn hợp",
    className: "bg-blue-500/90 text-white border-blue-400/30",
  },
};

export default function StoryCard({ story }: { story: StoryListItem }) {
  const badge = accessBadges[story.accessPolicy] || accessBadges[0];

  return (
    <Link to={`/stories/${story.id}`} className="group block focus:outline-none">
      {/* Cover container with 3D book spine and shadow */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-card border border-ink-border group-hover:border-gold/40 shadow-book group-hover:shadow-card-hover transition-all duration-300 book-spine">
        <img
          src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
          alt={story.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle inner border for glass refraction */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />

        {/* Gradient shadow on bottom of cover for text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Access policy badge */}
        <div className="absolute top-2 left-2 z-20">
          <span
            className={`inline-flex items-center text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border backdrop-blur-md font-medium tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Story Type badge */}
        {story.type === 1 && (
          <div className="absolute top-2 right-2 z-20">
            <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md bg-sky-500/90 text-white font-semibold border border-sky-400/40 shadow-sm backdrop-blur-md">
              Tranh
            </span>
          </div>
        )}

        {/* Views count on cover bottom right */}
        <div className="absolute bottom-1.5 right-2 z-20 flex items-center gap-1.5 text-[11px] text-slate-200 font-medium drop-shadow-md">
          <i className="fa-solid fa-eye text-slate-300 text-[10px]" />
          <span>{(story.viewCount ?? 0) >= 1000 ? `${((story.viewCount ?? 0) / 1000).toFixed(0)}k` : (story.viewCount ?? 0)}</span>
        </div>
      </div>

      {/* Story title */}
      <h3 className="font-serif text-ink-text group-hover:text-gold transition-colors font-semibold text-sm line-clamp-2 leading-snug mt-2.5">
        {story.title}
      </h3>

      {/* Author */}
      <p className="text-xs text-ink-muted truncate mt-1 flex items-center gap-1.5">
        <i className="fa-solid fa-user-pen text-ink-muted text-[10px] shrink-0" />
        <span className="truncate">{story.author}</span>
      </p>
    </Link>
  );
}
