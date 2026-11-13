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

type TtsEngine = "google" | "webspeech";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5066/api";

// Tách nội dung thành các câu ngắn hợp lý (< 180 ký tự) cho TTS, bỏ qua dòng chỉ có ký tự phân cách (---, ***, ...)
function splitTextIntoSentences(text: string, maxLength: number = 180): string[] {
  if (!text) return [];
  const rawParagraphs = text
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const result: string[] = [];

  for (const para of rawParagraphs) {
    const sentences = para.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [para];
    for (const s of sentences) {
      const trimmed = s.trim();
      // Chỉ giữ các câu có chứa ít nhất 1 chữ cái hoặc chữ số
      if (!trimmed || !/[\p{L}\p{N}]/u.test(trimmed)) continue;

      if (trimmed.length <= maxLength) {
        result.push(trimmed);
      } else {
        const words = trimmed.split(/\s+/);
        let currentChunk = "";
        for (const w of words) {
          if ((currentChunk + " " + w).trim().length <= maxLength) {
            currentChunk = (currentChunk + " " + w).trim();
          } else {
            if (currentChunk) result.push(currentChunk);
            currentChunk = w;
          }
        }
        if (currentChunk) result.push(currentChunk);
      }
    }
  }

  return result;
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
  const chunks = useMemo(() => splitTextIntoSentences(content, 180), [content]);

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [engine, setEngine] = useState<TtsEngine>("google");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [hasViWebSpeechVoice, setHasViWebSpeechVoice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sessionIdRef = useRef(0);
  const consecutiveErrorsRef = useRef(0);

  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const rateRef = useRef(rate);
  rateRef.current = rate;

  // Dừng hoàn toàn mọi luồng âm thanh hiện tại và hủy các callback cũ
  const stopAllAudio = useCallback(() => {
    sessionIdRef.current += 1;

    if (audioRef.current) {
      const prev = audioRef.current;
      prev.onended = null;
      prev.onerror = null;
      prev.onplaying = null;
      prev.pause();
      prev.removeAttribute("src");
      audioRef.current = null;
    }

    if (preloadAudioRef.current) {
      preloadAudioRef.current.removeAttribute("src");
      preloadAudioRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Load danh sách giọng hệ thống (không làm gián đoạn audio đang phát)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const viVoices = allVoices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith("vi") ||
          v.lang.toLowerCase().includes("vn") ||
          v.name.toLowerCase().includes("vietnam") ||
          v.name.toLowerCase().includes("tiếng việt")
      );
      setHasViWebSpeechVoice(viVoices.length > 0);
      setVoices(allVoices);

      setSelectedVoice((prev) => {
        if (prev) return prev;
        if (viVoices.length > 0) return viVoices[0];
        if (allVoices.length > 0) return allVoices[0];
        return null;
      });
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Phát câu/đoạn tại index
  const playChunk = useCallback(
    (index: number, forcedEngine?: TtsEngine) => {
      stopAllAudio();
      setErrorMsg(null);

      if (chunks.length === 0) {
        setIsPlaying(false);
        return;
      }

      if (index >= chunks.length) {
        setIsPlaying(false);
        setCurrentChunkIndex(chunks.length - 1);
        return;
      }

      const mySession = sessionIdRef.current;
      const activeEngine = forcedEngine || engine;
      const text = chunks[index];

      if (activeEngine === "google") {
        const url = `${API_BASE_URL}/tts?text=${encodeURIComponent(text)}&lang=vi`;
        const audio = new Audio(url);
        audio.playbackRate = rateRef.current;
        audioRef.current = audio;

        audio.onplaying = () => {
          if (mySession !== sessionIdRef.current) return;
          consecutiveErrorsRef.current = 0;
          setIsPlaying(true);

          // Chỉ tải trước câu tiếp theo khi câu hiện tại đã phát thành công
          if (index + 1 < chunks.length) {
            const nextUrl = `${API_BASE_URL}/tts?text=${encodeURIComponent(chunks[index + 1])}&lang=vi`;
            const pre = new Audio();
            pre.preload = "auto";
            pre.src = nextUrl;
            preloadAudioRef.current = pre;
          }
        };

        audio.onended = () => {
          if (mySession !== sessionIdRef.current) return;
          if (index + 1 < chunks.length) {
            setCurrentChunkIndex(index + 1);
            playChunk(index + 1, "google");
          } else {
            setIsPlaying(false);
            if (hasNextChapter && onNextChapter) {
              setTimeout(() => {
                if (mySession === sessionIdRef.current) {
                  onNextChapter();
                }
              }, 1200);
            }
          }
        };

        audio.onerror = () => {
          if (mySession !== sessionIdRef.current) return;
          consecutiveErrorsRef.current += 1;

          if (consecutiveErrorsRef.current <= 2 && index + 1 < chunks.length) {
            setTimeout(() => {
              if (mySession !== sessionIdRef.current) return;
              setCurrentChunkIndex(index + 1);
              playChunk(index + 1, "google");
            }, 600);
          } else {
            setIsPlaying(false);
            setErrorMsg("Không thể tải âm thanh Google TTS. Vui lòng kiểm tra kết nối mạng hoặc Backend.");
          }
        };

        audio.play().catch((err) => {
          if (mySession !== sessionIdRef.current) return;
          if (err?.name === "NotAllowedError") {
            setIsPlaying(false);
            setErrorMsg("Trình duyệt chặn tự phát. Hãy bấm nút Play để nghe.");
          } else if (err?.name !== "AbortError") {
            setIsPlaying(false);
          }
        });
      } else {
        // Web Speech API
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          setErrorMsg("Trình duyệt không hỗ trợ Web Speech API.");
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.lang = selectedVoice?.lang || "vi-VN";
        utterance.rate = rateRef.current;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          if (mySession !== sessionIdRef.current) return;
          if (index + 1 < chunks.length) {
            setCurrentChunkIndex(index + 1);
            playChunk(index + 1, "webspeech");
          } else {
            setIsPlaying(false);
            if (hasNextChapter && onNextChapter) {
              setTimeout(() => {
                if (mySession === sessionIdRef.current) {
                  onNextChapter();
                }
              }, 1200);
            }
          }
        };

        utterance.onerror = (e) => {
          if (mySession !== sessionIdRef.current) return;
          if (e.error !== "canceled" && e.error !== "interrupted") {
            setIsPlaying(false);
            setErrorMsg(`Lỗi Web Speech API: ${e.error}`);
          }
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    },
    [chunks, engine, selectedVoice, hasNextChapter, onNextChapter, stopAllAudio]
  );

  // Tự động phát khi mở player (dọn dẹp sạch sẽ khi đóng hoặc đổi chương)
  useEffect(() => {
    const timer = setTimeout(() => {
      playChunk(0);
    }, 60);

    return () => {
      clearTimeout(timer);
      stopAllAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play / Pause
  const togglePlay = useCallback(() => {
    setErrorMsg(null);

    if (isPlaying) {
      if (engine === "google" && audioRef.current) {
        audioRef.current.pause();
      } else if (engine === "webspeech" && typeof window !== "undefined") {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      if (engine === "google" && audioRef.current && audioRef.current.src) {
        const mySession = sessionIdRef.current;
        audioRef.current.playbackRate = rateRef.current;
        audioRef.current
          .play()
          .then(() => {
            if (mySession === sessionIdRef.current) setIsPlaying(true);
          })
          .catch(() => playChunk(currentChunkIndex));
      } else if (
        engine === "webspeech" &&
        typeof window !== "undefined" &&
        window.speechSynthesis.paused
      ) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        consecutiveErrorsRef.current = 0;
        playChunk(currentChunkIndex);
      }
    }
  }, [isPlaying, engine, currentChunkIndex, playChunk]);

  // Lùi câu
  const handlePrev = () => {
    consecutiveErrorsRef.current = 0;
    if (currentChunkIndex > 0) {
      const prevIdx = currentChunkIndex - 1;
      setCurrentChunkIndex(prevIdx);
      if (isPlaying) {
        playChunk(prevIdx);
      } else {
        stopAllAudio();
      }
    } else if (hasPrevChapter && onPrevChapter) {
      onPrevChapter();
    }
  };

  // Tiến câu
  const handleNext = () => {
    consecutiveErrorsRef.current = 0;
    if (currentChunkIndex + 1 < chunks.length) {
      const nextIdx = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIdx);
      if (isPlaying) {
        playChunk(nextIdx);
      } else {
        stopAllAudio();
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
    rateRef.current = nextRate;

    if (engine === "google" && audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    } else if (engine === "webspeech" && isPlaying) {
      playChunk(currentChunkIndex);
    }
  };

  // Tua tiến độ
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    consecutiveErrorsRef.current = 0;
    const newIdx = parseInt(e.target.value, 10);
    setCurrentChunkIndex(newIdx);
    if (isPlaying) {
      playChunk(newIdx);
    } else {
      stopAllAudio();
    }
  };

  // Phím tắt Space để Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

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
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 shrink-0">
                  {engine === "google" ? "Google Tiếng Việt" : "Giọng Hệ Thống"}
                </span>
                <span className="text-xs font-semibold truncate">
                  Chương {chapterNumber}: {chapterTitle}
                </span>
              </div>
              <p className="text-[11px] opacity-70 truncate mt-0.5 font-medium italic">
                {chunks.length === 0
                  ? "Chương này không có nội dung văn bản."
                  : `"${chunks[currentChunkIndex] || "Đang phát nội dung..."}"`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Tắt trình đọc Audio (Phím Esc)"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Inline error banner (if any) */}
        {errorMsg && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-[11px] flex items-center justify-between gap-2">
            <span>
              <i className="fa-solid fa-triangle-exclamation mr-1.5" />
              {errorMsg}
            </span>
            <button
              onClick={() => {
                consecutiveErrorsRef.current = 0;
                playChunk(currentChunkIndex);
              }}
              className="font-bold underline cursor-pointer shrink-0"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Progress Slider */}
        <div className="space-y-1 mb-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, chunks.length - 1)}
            value={currentChunkIndex}
            onChange={handleSeek}
            disabled={chunks.length === 0}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between items-center text-[10px] opacity-60 font-mono px-0.5">
            <span>
              Câu {chunks.length > 0 ? currentChunkIndex + 1 : 0} / {chunks.length}
            </span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Left: Speed button & Engine/Voice switch */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleRate}
              className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all cursor-pointer shadow-2xs"
              title="Thay đổi tốc độ đọc"
            >
              {rate.toFixed(1)}x
            </button>

            <div className="relative">
              <button
                onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                className="px-2 py-1 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer"
                title="Chọn giọng đọc hoặc đổi chế độ"
              >
                <i className="fa-solid fa-microphone text-[10px] text-orange-500" />
                <span className="max-w-[90px] truncate text-[11px] font-semibold">
                  {engine === "google"
                    ? "Google Chuẩn"
                    : selectedVoice?.name?.replace(/Microsoft |Google /, "") || "Hệ thống"}
                </span>
                <i className="fa-solid fa-chevron-down text-[8px] opacity-60" />
              </button>

              {showVoiceMenu && (
                <div className="absolute left-0 bottom-full mb-2 w-64 max-h-60 overflow-y-auto rounded-xl p-2 shadow-2xl border text-xs z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 animate-fadeIn space-y-1.5">
                  <div className="px-2 py-1 font-bold text-[10px] uppercase text-orange-600 dark:text-orange-400 border-b border-slate-100 dark:border-slate-800">
                    Chọn bộ phát giọng đọc
                  </div>

                  {/* Option 1: Google Natural Voice */}
                  <button
                    onClick={() => {
                      setEngine("google");
                      setShowVoiceMenu(false);
                      consecutiveErrorsRef.current = 0;
                      playChunk(currentChunkIndex, "google");
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      engine === "google"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>Google Tiếng Việt</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded-full">
                          Chuẩn 100%
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        Giọng tự nhiên, không cần cài đặt
                      </div>
                    </div>
                    {engine === "google" && <i className="fa-solid fa-check text-xs" />}
                  </button>

                  {/* Option 2: Web Speech API */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="px-2 py-0.5 text-[10px] font-semibold opacity-60">
                      Giọng hệ thống (Web Speech API)
                    </div>

                    {!hasViWebSpeechVoice && (
                      <div className="px-2 py-1.5 my-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-700 dark:text-amber-400">
                        <i className="fa-solid fa-circle-info mr-1" />
                        Windows chưa có gói Tiếng Việt. Nên dùng <b>Google Tiếng Việt</b> ở trên.
                      </div>
                    )}

                    {voices.map((v, i) => {
                      const isVi =
                        v.lang.toLowerCase().startsWith("vi") ||
                        v.name.toLowerCase().includes("vietnam");
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setEngine("webspeech");
                            setSelectedVoice(v);
                            setShowVoiceMenu(false);
                            playChunk(currentChunkIndex, "webspeech");
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs truncate transition-colors flex items-center justify-between cursor-pointer ${
                            engine === "webspeech" && selectedVoice === v
                              ? "bg-orange-500 text-white font-semibold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="truncate">
                            {isVi ? "🇻🇳 " : "🌐 "}
                            {v.name}
                          </span>
                          {engine === "webspeech" && selectedVoice === v && (
                            <i className="fa-solid fa-check text-[10px]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Playback Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentChunkIndex === 0 && !hasPrevChapter}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
              title="Câu trước"
            >
              <i className="fa-solid fa-backward-step text-xs" />
            </button>

            <button
              onClick={togglePlay}
              disabled={chunks.length === 0}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:brightness-110 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all cursor-pointer disabled:opacity-40"
              title={isPlaying ? "Tạm dừng (Phím Space)" : "Phát tiếp (Phím Space)"}
            >
              <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play pl-0.5"} text-base`} />
            </button>

            <button
              onClick={handleNext}
              disabled={currentChunkIndex >= chunks.length - 1 && !hasNextChapter}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
              title="Câu sau"
            >
              <i className="fa-solid fa-forward-step text-xs" />
            </button>
          </div>

          {/* Right: Keyboard shortcut hint */}
          <div className="text-[11px] opacity-50 hidden sm:flex items-center gap-1 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">
              Space
            </kbd>
            <span>Play/Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
}
