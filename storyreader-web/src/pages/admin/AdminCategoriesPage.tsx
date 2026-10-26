import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGenres, createGenre, updateGenre, deleteGenre, type Genre } from "../../api/genres";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [genreName, setGenreName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createGenre(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      setIsAddOpen(false);
      setGenreName("");
      setErrorMsg("");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi tạo thể loại.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateGenre(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      setEditingGenre(null);
      setGenreName("");
      setErrorMsg("");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật thể loại.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGenre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Không thể xóa thể loại này.");
    },
  });

  const handleOpenAdd = () => {
    setGenreName("");
    setErrorMsg("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (genre: Genre) => {
    setGenreName(genre.name);
    setErrorMsg("");
    setEditingGenre(genre);
  };

  const handleDelete = (genre: Genre) => {
    if (confirm(`Bạn có chắc muốn xóa thể loại "${genre.name}"?`)) {
      deleteMutation.mutate(genre.id);
    }
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName.trim()) {
      setErrorMsg("Vui lòng nhập tên thể loại.");
      return;
    }
    createMutation.mutate(genreName.trim());
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGenre || !genreName.trim()) {
      setErrorMsg("Vui lòng nhập tên thể loại.");
      return;
    }
    updateMutation.mutate({ id: editingGenre.id, name: genreName.trim() });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-ink-text font-bold">Quản lý Thể loại</h1>
          <p className="text-sm text-ink-muted mt-1">Danh mục thể loại truyện được kết nối trực tiếp với CSDL</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-plus text-xs" />
          Thêm thể loại
        </button>
      </div>

      <div className="bg-ink-card border border-ink-border rounded-2xl overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-ink-bg/60 border-b border-ink-border">
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Tên thể loại</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Slug đường dẫn</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Số truyện</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-ink-muted">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin text-gold text-base" />
                      <span>Đang tải danh sách thể loại từ hệ thống...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-red-400">
                    Không thể tải danh sách thể loại. Vui lòng thử lại.
                  </td>
                </tr>
              ) : !categories || categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-ink-muted">
                    Chưa có thể loại nào trong cơ sở dữ liệu.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-ink-bg/30 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink-text text-sm">{cat.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-ink-muted font-mono">{cat.slug || cat.name.toLowerCase()}</td>
                    <td className="py-3.5 px-4 text-sm">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
                        {cat.storyCount} truyện
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-3">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="text-sm font-medium text-gold hover:text-gold-dim transition-colors inline-flex items-center gap-1"
                      >
                        <i className="fa-solid fa-pen-to-square text-xs" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deleteMutation.isPending}
                        className="text-sm font-medium text-rose-400 hover:text-rose-500 transition-colors inline-flex items-center gap-1"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md bg-ink-card border border-ink-border rounded-2xl shadow-2xl p-6">
            <h2 className="font-serif text-lg font-bold text-slate-900 mb-4">Thêm thể loại mới</h2>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                  Tên thể loại <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  placeholder="VD: Huyền Huyễn, Đô Thị, v.v."
                  className="w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-2.5 text-ink-text placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-rose-400 text-xs">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-ink-muted hover:text-ink-text hover:bg-ink-bg border border-ink-border transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Đang tạo..." : "Lưu thể loại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingGenre(null)} />
          <div className="relative w-full max-w-md bg-ink-card border border-ink-border rounded-2xl shadow-2xl p-6">
            <h2 className="font-serif text-lg font-bold text-slate-900 mb-4">Cập nhật thể loại</h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                  Tên thể loại <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  className="w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-2.5 text-ink-text placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-rose-400 text-xs">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGenre(null)}
                  className="px-4 py-2 rounded-xl text-sm text-ink-muted hover:text-ink-text hover:bg-ink-bg border border-ink-border transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
