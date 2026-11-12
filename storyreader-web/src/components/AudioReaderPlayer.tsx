import { useState, useEffect, useRef, useCallback, useMemo } from "react";

interface AudioReaderPlayerProps {
  content: string;
  chapterTitle: string;
  chapterNumber: number;
  theme: "dark" | "light" | "sepia";
  onClose: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
}

export default function AudioReaderPlayer({
  content,
  chapterTitle,
  chapterNumber,
  theme,
  onClose,
  onNextChapter,
  onPrevChapter,
  hasNextChapter,
  hasPrevChapter,
}: AudioReaderPlayerProps) {
  // 1. Phân tách văn bản thành các đoạn hợp lý (paragraphs/sentences)
  const chunks = useMemo(() => {
    if (!content) return [];
    return content
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  // 2. Load danh sách giọng đọc tiếng Việt
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Ưu tiên giọng tiếng Việt
      const viVoices = allVoices.filter(
        (v) => v.lang.startsWith("vi") || v.lang.includes("VN") || v.lang.includes("vi_VN")
      );
      setVoices(viVoices.length > 0 ? viVoices : allVoices);

      if (viVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(viVoices[0]);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 3. Hàm phát đoạn văn bản hiện tại
  const speakChunk = useCallback(
    (index: number) => {
      if (!isSupported || chunks.length === 0) return;

      window.speechSynthesis.cancel();

      if (index >= chunks.length) {
        setIsPlaying(false);
        setCurrentChunkIndex(chunks.length - 1);
        return;
      }

      const text = chunks[index];
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = selectedVoice?.lang || "vi-VN";
      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (isPlayingRef.current) {
          if (index + 1 < chunks.length) {
            setCurrentChunkIndex(index + 1);
            speakChunk(index + 1);
          } else {
            setIsPlaying(false);
            if (hasNextChapter && onNextChapter) {
              // Tự động chuyển chương khi nghe hết
              setTimeout(() => {
                onNextChapter();
              }, 1500);
            }
          }
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("TTS Error:", e.error);
        }
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    },
    [chunks, isSupported, selectedVoice, rate, hasNextChapter, onNextChapter]
  );

  // Bắt đầu đọc khi mở player
  useEffect(() => {
    speakChunk(0);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Tạm dừng / Tiếp tục
  const togglePlay = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speakChunk(currentChunkIndex);
    }
  };

  // Chuyển đoạn trước
  const handlePrev = () => {
    if (currentChunkIndex > 0) {
      const prevIdx = currentChunkIndex - 1;
      setCurrentChunkIndex(prevIdx);
      if (isPlaying) {
        speakChunk(prevIdx);
      }
    } else if (hasPrevChapter && onPrevChapter) {
      onPrevChapter();
    }
  };

  // Chuyển đoạn sau
  const handleNext = () => {
    if (currentChunkIndex + 1 < chunks.length) {
      const nextIdx = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIdx);
      if (isPlaying) {
        speakChunk(nextIdx);
      }
    } else if (hasNextChapter && onNextChapter) {
      onNextChapter();
    }
  };

  // Đổi tốc độ đọc
  const cycleRate = () => {
    const rates = [0.8, 1.0, 1.25, 1.5, 2.0];
    const curIdx = rates.indexOf(rate);
    const nextRate = rates[(curIdx + 1) % rates.length];
    setRate(nextRate);
    if (isPlaying) {
      speakChunk(currentChunkIndex);
    }
  };

  // Tua đến vị trí đoạn
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIdx = parseInt(e.target.value, 10);
    setCurrentChunkIndex(newIdx);
    if (isPlaying) {
      speakChunk(newIdx);
    }
  };

  // Phím tắt Space để Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentChunkIndex, chunks]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-rose-900/90 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs">
        <i className="fa-solid fa-triangle-exclamation text-amber-300" />
        <span>Trình duyệt của bạn không hỗ trợ tính năng Web Speech API.</span>
        <button onClick={onClose} className="p-1 hover:text-white/80 cursor-pointer">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    );
  }

  const progressPercent =
    chunks.length > 0 ? Math.round(((currentChunkIndex + 1) / chunks.length) * 100) : 0;

  const isDark = theme === "dark";

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-[94%] max-w-xl z-50 animate-slideUp">
      <div
        className={`backdrop-blur-xl border rounded-2xl p-4 shadow-2xl transition-all ${
          isDark
            ? "bg-[#141923]/95 border-slate-700/80 text-white shadow-black/60"
            : theme === "sepia"
            ? "bg-[#F5EFEB]/95 border-[#D6C5A5] text-[#3D2E1E] shadow-[#D6C5A5]/40"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60"
        }`}
      >
        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Animated Equalizer Waves */}
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className="w-1 bg-orange-500 rounded-full animate-pulse h-3" />
                  <span className="w-1 bg-amber-500 rounded-full animate-bounce h-4" />
                  <span className="w-1 bg-orange-600 rounded-full animate-pulse h-2" />
                </div>
              ) : (
                <i className="fa-solid fa-headphones text-orange-500 text-xs" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  Audio Reader
                </span>
                <span className="text-xs font-semibold truncate">
                  Chương {chapterNumber}: {chapterTitle}
                </span>
              </div>
              <p className="text-[11px] opacity-60 truncate mt-0.5">
                {chunks[currentChunkIndex] || "Đang đọc chương..."}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Tắt trình đọc Audio"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Progress Slider */}
        <div className="space-y-1 mb-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, chunks.length - 1)}
            value={currentChunkIndex}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between items-center text-[10px] opacity-60 font-mono px-0.5">
            <span>
              Đoạn {currentChunkIndex + 1} / {chunks.length}
            </span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Left: Speed button & Voice switch */}
          <div className="flex items-center gap-1.5">
            {/* Speed toggle */}
            <button
              onClick={cycleRate}
              className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all cursor-pointer shadow-2xs"
              title="Thay đổi tốc độ đọc"
            >
              {rate.toFixed(1)}x
            </button>

            {/* Voice Dropdown */}
            {voices.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                  className="px-2 py-1 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Chọn giọng đọc"
                >
                  <i className="fa-solid fa-microphone text-[10px] opacity-70" />
                  <span className="max-w-[70px] truncate text-[11px]">
                    {selectedVoice?.name?.replace(/Microsoft |Google /, "") || "Giọng đọc"}
                  </span>
                  <i className="fa-solid fa-chevron-down text-[8px] opacity-60" />
                </button>

                {showVoiceMenu && (
                  <div className="absolute left-0 bottom-full mb-2 w-48 max-h-48 overflow-y-auto rounded-xl p-1.5 shadow-2xl border text-xs z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 animate-fadeIn">
                    <div className="px-2 py-1 font-bold text-[10px] uppercase opacity-50 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Danh sách giọng đọc
                    </div>
                    {voices.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedVoice(v);
                          setShowVoiceMenu(false);
                          if (isPlaying) {
                            speakChunk(currentChunkIndex);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors flex items-center justify-between ${
                          selectedVoice === v
                            ? "bg-orange-500 text-white font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">{v.name}</span>
                        {selectedVoice === v && <i className="fa-solid fa-check text-[10px]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: Playback Buttons */}
          <div className="flex items-center gap-2">
            {/* Prev chunk */}
            <button
              onClick={handlePrev}
              disabled={currentChunkIndex === 0 && !hasPrevChapter}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
              title="Đoạn trước"
            >
              <i className="fa-solid fa-backward-step text-xs" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:brightness-110 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
              title={isPlaying ? "Tạm dừng (Phím Space)" : "Phát tiếp (Phím Space)"}
            >
              <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play pl-0.5"} text-base`} />
            </button>

            {/* Next chunk */}
            <button
              onClick={handleNext}
              disabled={currentChunkIndex === chunks.length - 1 && !hasNextChapter}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
              title="Đoạn sau"
            >
              <i className="fa-solid fa-forward-step text-xs" />
            </button>
          </div>

          {/* Right: Keyboard shortcut hint */}
          <div className="text-[11px] opacity-50 hidden sm:flex items-center gap-1 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">Space</kbd>
            <span>Play/Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
}
