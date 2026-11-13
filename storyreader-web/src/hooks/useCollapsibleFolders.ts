import { useMemo, useState } from "react";
import type { ChapterGroup } from "../utils/chapterGrouping";

/**
 * Quản lý đóng/mở nhóm chương theo phần/tập mà không cần useEffect đồng bộ state.
 * Mặc định mọi thư mục đều đang mở; chỉ lưu tập tên thư mục bị người dùng thu gọn.
 */
export function useCollapsibleFolders(groups: ChapterGroup[], contextKey: string) {
  const [collapsedState, setCollapsedState] = useState<{ key: string; names: Set<string> }>({
    key: "",
    names: new Set(),
  });

  const collapsedFolders = useMemo(
    () => (collapsedState.key === contextKey ? collapsedState.names : new Set<string>()),
    [collapsedState, contextKey]
  );

  const isExpanded = (partName: string) => !collapsedFolders.has(partName);

  const allExpanded =
    groups.length > 0 && groups.every((group) => !collapsedFolders.has(group.partName));

  const toggleFolder = (partName: string) => {
    setCollapsedState((prev) => {
      const base = prev.key === contextKey ? prev.names : new Set<string>();
      const next = new Set(base);
      if (next.has(partName)) next.delete(partName);
      else next.add(partName);
      return { key: contextKey, names: next };
    });
  };

  const toggleAll = () => {
    setCollapsedState({
      key: contextKey,
      names: allExpanded ? new Set(groups.map((g) => g.partName)) : new Set(),
    });
  };

  return { isExpanded, allExpanded, toggleFolder, toggleAll };
}
