import { Link } from "react-router-dom";
import type { StoryListItem } from "../api/stories";

const accessBadges: Record<number, { label: string; className: string }> = {
  0: {
    label: "Miễn phí",
    className: "bg-emerald-500 text-white font-medium",
  },
  1: {
    label: "VIP",
    className: "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-xs",
  },
  2: {
    label: "Hỗn hợp",
    className: "bg-blue-500 text-white font-medium",
  },
};

export default function StoryCard({ story }: { story: StoryListItem }) {
  const badge = accessBadges[story.accessPolicy] || accessBadges[0];

  return (
    <Link to={`/stories/${story.id}`} className="group block focus:outline-none">
      {/* Cover container with soft shadow and rounded corners */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group-hover:border-orange-400 shadow-sm group-hover:shadow-md transition-all duration-300 book-spine">
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

        {/* Access policy badge */}
        <div className="absolute top-2 left-2 z-20">
          <span
            className={`inline-flex items-center text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-semibold tracking-wide shadow-xs ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Story Type badge */}
        {story.type === 1 ? (
          <div className="absolute top-2 right-2 z-20">
            <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md bg-sky-500 text-white font-semibold shadow-xs">
              Tranh
            </span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 z-20">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-black/40 text-white text-xs hover:bg-orange-500 transition-colors backdrop-blur-xs">
              <i className="fa-regular fa-bookmark text-[11px]" />
            </span>
          </div>
        )}

        {/* Views count on bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none flex items-end justify-between p-2">
          <span className="text-[10px] text-white/90 font-medium truncate max-w-[100px]">
            {story.type === 1 ? "Truyện tranh" : "Truyện chữ"}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-white font-semibold drop-shadow-xs">
            <i className="fa-solid fa-eye text-[10px] text-amber-300" />
            <span>{(story.viewCount ?? 0) >= 1000 ? `${((story.viewCount ?? 0) / 1000).toFixed(0)}k` : (story.viewCount ?? 0)}</span>
          </span>
        </div>
      </div>

      {/* Story title below cover - crisp Slate 900 text */}
      <h3 className="font-sans font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-sm line-clamp-2 leading-snug mt-2">
        {story.title}
      </h3>

      {/* Subtitle: Author & Chapter info */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
        <span className="truncate max-w-[120px]">{story.author || "Đang cập nhật"}</span>
        <span className="text-[11px] text-slate-400 font-medium shrink-0">Mới</span>
      </div>
    </Link>
  );
}
