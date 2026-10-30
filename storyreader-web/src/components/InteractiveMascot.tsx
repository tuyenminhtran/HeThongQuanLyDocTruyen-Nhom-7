import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { AtmosphereType } from "./AtmosphericOverlay";

interface InteractiveMascotProps {
  currentAtmosphere?: AtmosphereType;
  onAtmosphereChange?: (type: AtmosphereType) => void;
}

const CAT_QUOTES = [
  "Meow~ Đọc sách là chuyến phiêu lưu kỳ diệu nhất! 📖",
  "Hôm nay bạn đã đọc được bao nhiêu chương rồi nè? ✨",
  "Đọc lâu nhớ chớp mắt và uống ngụm nước nhé bạn ơi! 💧",
  "Bật mí: Bấm phím 'E' trong lúc đọc truyện sẽ có hoa rơi đó! 🌸",
  "Zero Two & Hiro gửi lời chào nồng nhiệt đến bạn! 🍓",
  "Thiếu tá Gilbert và Violet Evergarden chúc bạn ngày an lành! ✉️",
  "Frieren bảo: 'Phép thuật tuyệt nhất là phép làm bạn mỉm cười!' 🪄",
  "Thử click liên tục vào mình 5 lần xem điều gì kỳ diệu xảy ra nào! 😉",
  "Nhóm 7 (StoryReader) gửi ngàn lời yêu thương đến bạn! 💖",
];

// Tạo âm thanh Meow dễ thương bằng Web Audio API thuần (không cần file mp3 ngoài)
function playCuteMeow() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Bỏ qua nếu trình duyệt chặn audio tự động
  }
}

// Âm thanh phép màu khi biến hình thành Totoro
function playTransformationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const now = ctx.currentTime + i * 0.09;

      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  } catch {
    // Bỏ qua nếu audio context bị chặn
  }
}

export default function InteractiveMascot({
  currentAtmosphere = "none",
  onAtmosphereChange,
}: InteractiveMascotProps) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTotoro, setIsTotoro] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showAtmosphereMenu, setShowAtmosphereMenu] = useState(false);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tự động chào hỏi lần đầu sau 2.5 giây (chỉ chạy ở trang người đọc, không chạy ở admin)
  useEffect(() => {
    if (isAdmin) return;
    const timer = setTimeout(() => {
      showBubble("Chào bạn! Mình là mèo Jiji, linh vật của StoryReader nè~ 🐾");
    }, 2500);
    return () => clearTimeout(timer);
  }, [isAdmin]);

  const showBubble = (msg: string) => {
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    setBubbleText(msg);
    bubbleTimeoutRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 4500);
  };

  const handleMascotClick = () => {
    playCuteMeow();

    // Tăng combo click
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickResetTimeoutRef.current) clearTimeout(clickResetTimeoutRef.current);
    clickResetTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3200);

    // Kích hoạt biến hình Totoro khi click đủ 5 lần liên tiếp!
    if (nextCount >= 5 && !isTotoro) {
      triggerTotoroTransformation();
      return;
    }

    if (isTotoro) {
      showBubble("Totoro bảo: 'Đừng quên thư giãn và tận hưởng từng câu chuyện đẹp nhé!' 🍃");
      return;
    }

    // Câu thoại ngẫu nhiên
    if (nextCount === 3) {
      showBubble("Ồ! Bạn vừa click 3 lần rồi kìa, click thêm 2 lần nữa xem nào! ⚡");
    } else {
      const randomQuote = CAT_QUOTES[Math.floor(Math.random() * CAT_QUOTES.length)];
      showBubble(randomQuote);
    }
  };

  const triggerTotoroTransformation = () => {
    playTransformationChime();
    setShowSparkles(true);
    setIsTotoro(true);
    setClickCount(0);
    showBubble("🎉 BÙM! Bạn đã đánh thức Thần Rừng Totoro (Easter Egg bí mật của Nhóm 7)! 🍃");

    setTimeout(() => {
      setShowSparkles(false);
    }, 2000);
  };

  const handleRevertToCat = () => {
    setIsTotoro(false);
    showBubble("Meow~ Mèo Jiji đã quay trở lại bên bạn đây! 🐾");
  };

  // Không hiển thị linh vật đọc truyện trên các trang quản trị hệ thống (Admin)
  if (isAdmin) {
    return null;
  }

  // Nút thu nhỏ
  if (isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          showBubble("Meow! Mình đã quay lại đây nè! 🐾");
        }}
        className="fixed bottom-4 right-4 z-40 w-11 h-11 rounded-full bg-slate-900 border-2 border-orange-400 text-white shadow-xl hover:scale-110 hover:border-orange-500 transition-all flex items-center justify-center cursor-pointer group"
        title="Mở Linh Vật StoryReader"
      >
        <span className="text-lg group-hover:rotate-12 transition-transform">🐾</span>
      </button>
    );
  }

  return (
    <aside aria-label="Linh vật tương tác" className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end select-none pointer-events-auto">
      {/* ============================================================ */}
      {/* 1. BONG BÓNG THOẠI (SPEECH BUBBLE)                           */}
      {/* ============================================================ */}
      {bubbleText && (
        <div className="mb-2 max-w-[240px] sm:max-w-[280px] bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-xs p-3 rounded-2xl shadow-xl relative animate-bounce-short">
          <p className="font-medium leading-relaxed">{bubbleText}</p>
          {/* Mũi nhọn bong bóng thoại */}
          <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MENU CHỌN HIỆU ỨNG BẦU KHÔNG KHÍ (ATMOSPHERE CONTROLS)     */}
      {/* ============================================================ */}
      {showAtmosphereMenu && (
        <div className="mb-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-2xl text-xs space-y-2 w-52 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
            <span className="flex items-center gap-1.5 text-orange-600">
              <i className="fa-solid fa-wand-magic-sparkles text-xs" />
              Bầu không khí
            </span>
            <button
              onClick={() => setShowAtmosphereMenu(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => {
                onAtmosphereChange?.("sakura");
                showBubble("🌸 Đã bật mưa hoa anh đào bay lượn!");
                setShowAtmosphereMenu(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                currentAtmosphere === "sakura"
                  ? "bg-pink-100 text-pink-700 font-bold"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span>🌸 Cánh hoa anh đào</span>
              {currentAtmosphere === "sakura" && <i className="fa-solid fa-check text-[10px]" />}
            </button>

            <button
              onClick={() => {
                onAtmosphereChange?.("fireflies");
                showBubble("🌟 Đã bật đàn đom đóm vàng lấp lánh!");
                setShowAtmosphereMenu(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                currentAtmosphere === "fireflies"
                  ? "bg-amber-100 text-amber-800 font-bold"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span>🌟 Đom đóm mùa hè</span>
              {currentAtmosphere === "fireflies" && <i className="fa-solid fa-check text-[10px]" />}
            </button>

            <button
              onClick={() => {
                onAtmosphereChange?.("rain");
                showBubble("🌧️ Đã bật tiếng mưa rơi rả rích!");
                setShowAtmosphereMenu(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                currentAtmosphere === "rain"
                  ? "bg-sky-100 text-sky-800 font-bold"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span>🌧️ Mưa rơi nhẹ mờ ảo</span>
              {currentAtmosphere === "rain" && <i className="fa-solid fa-check text-[10px]" />}
            </button>

            <button
              onClick={() => {
                onAtmosphereChange?.("stars");
                showBubble("✨ Đã bật bầu trời đầy sao và sao băng!");
                setShowAtmosphereMenu(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                currentAtmosphere === "stars"
                  ? "bg-purple-100 text-purple-800 font-bold"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span>✨ Bầu trời sao & Sao băng</span>
              {currentAtmosphere === "stars" && <i className="fa-solid fa-check text-[10px]" />}
            </button>

            <button
              onClick={() => {
                onAtmosphereChange?.("none");
                showBubble("Đã tắt hiệu ứng bối cảnh!");
                setShowAtmosphereMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ❌ Tắt hiệu ứng
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MASCOT CONTAINER (MÈO JIJI HOẶC TOTORO)                   */}
      {/* ============================================================ */}
      <div className="relative group flex items-end gap-1">
        
        {/* Nút nhỏ thao tác nhanh (Hiện khi hover) */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
          {/* Nút bật menu hiệu ứng */}
          <button
            onClick={() => setShowAtmosphereMenu(!showAtmosphereMenu)}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-orange-500 shadow-md hover:bg-orange-50 flex items-center justify-center text-xs cursor-pointer transition-colors"
            title="Bật hiệu ứng bối cảnh (Hoa rơi, Đom đóm, Mưa...)"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-[10px]" />
          </button>

          {/* Nút hoàn về mèo nếu đang là Totoro */}
          {isTotoro && (
            <button
              onClick={handleRevertToCat}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 shadow-md hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer transition-colors"
              title="Đổi lại thành Mèo Jiji"
            >
              🐱
            </button>
          )}

          {/* Nút thu nhỏ */}
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 shadow-md hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer transition-colors"
            title="Tạm ẩn linh vật"
          >
            <i className="fa-solid fa-minus text-[10px]" />
          </button>
        </div>

        {/* Nút chính tương tác (Clickable Character) */}
        <div
          onClick={handleMascotClick}
          className="relative cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
          title={isTotoro ? "Thần Rừng Totoro (Easter Egg Nhóm 7)" : "Mèo Jiji (Click 5 lần để biến hình Totoro!)"}
        >
          {/* Hiệu ứng lấp lánh xung quanh khi biến hình */}
          {showSparkles && (
            <div className="absolute -inset-4 pointer-events-none flex items-center justify-center animate-spin">
              <span className="text-xl absolute -top-2 left-2 animate-ping">✨</span>
              <span className="text-xl absolute top-1 -right-2 animate-ping">🌟</span>
              <span className="text-xl absolute -bottom-1 -left-1 animate-ping">🎉</span>
              <span className="text-xl absolute bottom-2 right-1 animate-ping">✨</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TRẠNG THÁI 1: CHÚ MÈO ĐEN JIJI (SVG NGHỆ THUẬT)       */}
          {/* ==================================================== */}
          {!isTotoro ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 relative filter drop-shadow-lg">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                {/* Đuôi mèo uốn lượn */}
                <path
                  d="M 65 80 C 85 75, 95 60, 90 45 C 87 38, 80 40, 82 46 C 85 55, 78 68, 65 72"
                  fill="#1e2430"
                  className="animate-wiggle origin-bottom"
                />

                {/* Thân mèo đen bóng */}
                <ellipse cx="50" cy="68" rx="22" ry="24" fill="#181d28" />

                {/* Ngực áo đỏ xinh xắn */}
                <circle cx="50" cy="52" r="4.5" fill="#ef4444" />
                <circle cx="50" cy="52" r="2" fill="#fbbf24" />

                {/* Hai tai mèo nhọn */}
                <polygon points="32,32 20,6 44,20" fill="#181d28" />
                <polygon points="32,29 25,12 40,21" fill="#f472b6" opacity="0.6" />

                <polygon points="68,32 80,6 56,20" fill="#181d28" />
                <polygon points="68,29 75,12 60,21" fill="#f472b6" opacity="0.6" />

                {/* Đầu mèo */}
                <circle cx="50" cy="36" r="22" fill="#181d28" />

                {/* Mắt to tròn anime long lanh */}
                <ellipse cx="41" cy="35" rx="5.5" ry="7" fill="#ffffff" />
                <ellipse cx="42" cy="35" rx="3.5" ry="5.5" fill="#6366f1" />
                <circle cx="43" cy="33" r="1.8" fill="#ffffff" />

                <ellipse cx="59" cy="35" rx="5.5" ry="7" fill="#ffffff" />
                <ellipse cx="58" cy="35" rx="3.5" ry="5.5" fill="#6366f1" />
                <circle cx="59" cy="33" r="1.8" fill="#ffffff" />

                {/* Mũi hồng */}
                <polygon points="50,42 48,40 52,40" fill="#f472b6" />

                {/* Miệng mèo cười */}
                <path
                  d="M 46 44 Q 50 47 54 44"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Râu mèo */}
                <line x1="33" y1="39" x2="16" y2="36" stroke="#e2e8f0" strokeWidth="1" opacity="0.7" />
                <line x1="33" y1="43" x2="18" y2="44" stroke="#e2e8f0" strokeWidth="1" opacity="0.7" />
                <line x1="67" y1="39" x2="84" y2="36" stroke="#e2e8f0" strokeWidth="1" opacity="0.7" />
                <line x1="67" y1="43" x2="82" y2="44" stroke="#e2e8f0" strokeWidth="1" opacity="0.7" />

                {/* Hai bàn chân trước */}
                <ellipse cx="43" cy="88" rx="6" ry="4" fill="#12161f" />
                <ellipse cx="57" cy="88" rx="6" ry="4" fill="#12161f" />
              </svg>

              {/* Huy hiệu gợi ý click combo */}
              {clickCount > 0 && clickCount < 5 && (
                <div className="absolute -top-2 -right-1 bg-orange-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-ping">
                  {clickCount}
                </div>
              )}
            </div>
          ) : (
            /* ==================================================== */
            /* TRẠNG THÁI 2: ĐẠI THẦN RỪNG TOTORO (SIÊU CƯNG)       */
            /* ==================================================== */
            <div className="w-20 h-22 sm:w-24 sm:h-26 relative filter drop-shadow-2xl animate-float">
              <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible">
                {/* Chiếc lá sen đội đầu */}
                <path
                  d="M 40 8 Q 50 0 60 8 Q 66 16 50 16 Q 34 16 40 8 Z"
                  fill="#22c55e"
                  stroke="#15803d"
                  strokeWidth="1"
                />
                <line x1="50" y1="4" x2="50" y2="15" stroke="#166534" strokeWidth="1" />

                {/* Hai tai Totoro dài */}
                <ellipse cx="36" cy="20" rx="4.5" ry="12" fill="#78716c" transform="rotate(-15 36 20)" />
                <ellipse cx="64" cy="20" rx="4.5" ry="12" fill="#78716c" transform="rotate(15 64 20)" />

                {/* Thân xám béo tròn của Totoro */}
                <ellipse cx="50" cy="62" rx="34" ry="38" fill="#78716c" />

                {/* Bụng trắng to tròn */}
                <ellipse cx="50" cy="68" rx="24" ry="26" fill="#fdfbf7" />

                {/* Các họa tiết hình chữ V (mũi tên xám) trên ngực Totoro */}
                <path d="M 42 54 Q 45 51 48 54" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 52 54 Q 55 51 58 54" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 37 61 Q 40 58 43 61" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 47 61 Q 50 58 53 61" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 57 61 Q 60 58 63 61" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />

                {/* Mắt to tròn nhìn ngây thơ */}
                <circle cx="37" cy="38" r="5" fill="#ffffff" />
                <circle cx="37" cy="38" r="2.2" fill="#1c1917" />
                <circle cx="38" cy="37" r="0.8" fill="#ffffff" />

                <circle cx="63" cy="38" r="5" fill="#ffffff" />
                <circle cx="63" cy="38" r="2.2" fill="#1c1917" />
                <circle cx="64" cy="37" r="0.8" fill="#ffffff" />

                {/* Mũi đen nhỏ */}
                <ellipse cx="50" cy="41" rx="2.5" ry="1.5" fill="#1c1917" />

                {/* Nụ cười híp mí thương hiệu Totoro */}
                <path
                  d="M 36 45 Q 50 52 64 45"
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Râu Totoro */}
                <line x1="28" y1="41" x2="12" y2="40" stroke="#44403c" strokeWidth="1" />
                <line x1="28" y1="44" x2="14" y2="46" stroke="#44403c" strokeWidth="1" />
                <line x1="72" y1="41" x2="88" y2="40" stroke="#44403c" strokeWidth="1" />
                <line x1="72" y1="44" x2="86" y2="46" stroke="#44403c" strokeWidth="1" />

                {/* Hai bàn tay Totoro ôm hông */}
                <ellipse cx="20" cy="68" rx="5" ry="9" fill="#57534e" transform="rotate(20 20 68)" />
                <ellipse cx="80" cy="68" rx="5" ry="9" fill="#57534e" transform="rotate(-20 80 68)" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
