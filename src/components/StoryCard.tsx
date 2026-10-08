import { Link } from "react-router-dom";
import type { StoryListItem } from "../api/stories";

const accessLabel = ["Miễn phí", "Trả phí", "Mixed"];

export default function StoryCard({ story }: { story: StoryListItem }) {
  return (
    <Link to={`/stories/${story.id}`} className="block group">
      <div className="aspect-[2/3] overflow-hidden rounded-md bg-ink-card border border-ink-border">
        <img
          src={story.coverImageUrl || "https://placehold.co/300x450?text=No+Cover"}
          alt={story.title}
          className="w-full h-full object-cover group-hover:opacity-90 transition"
        />
      </div>
      <h3 className="font-serif text-ink-text mt-2 leading-snug line-clamp-2">
        {story.title}
      </h3>
      <p className="text-sm text-ink-muted truncate">{story.author}</p>
      <div className="flex justify-between items-center mt-1 text-xs text-ink-muted">
        <span>{accessLabel[story.accessPolicy]}</span>
        <span>{story.viewCount} lượt xem</span>
      </div>
    </Link>
  );
}
