import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ==========================================
// 8-BIT AUDIO SYNTHESIZER (Pure Web Audio API)
// ==========================================
function play8BitSound(type: "coin" | "jump" | "levelup" | "fanfare" | "heart") {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "coin") {
      // Classic 8-bit Mario style coin (B5 -> E6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "jump") {
      // 8-bit jump sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "heart") {
      // Warm chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "levelup") {
      // Arpeggio
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C, E, G, C, E, G
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.05, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.09);
      });
    } else if (type === "fanfare") {
      // Victory Fanfare
      const notes = [
        { f: 523.25, d: 0.1 },
        { f: 523.25, d: 0.1 },
        { f: 523.25, d: 0.1 },
        { f: 523.25, d: 0.25 },
        { f: 415.3, d: 0.25 },
        { f: 466.16, d: 0.25 },
        { f: 523.25, d: 0.2 },
        { f: 466.16, d: 0.1 },
        { f: 523.25, d: 0.4 },
      ];
      let offset = 0;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(note.f, now + offset);
        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + note.d + 0.05);
        offset += note.d * 0.85;
      });
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
}

// ==========================================
// TEAM MEMBERS PROFILE DATA
// ==========================================
interface MemberProfile {
  name: string;
  github: string;
  roleTitle: string;
  rpgClass: string;
  badgeColor: string;
  avatarSeed: string;
  stats: { label: string; value: number }[];
  specialMove: string;
  quote: string;
  contributions: string[];
}

const TEAM_MEMBERS: MemberProfile[] = [
  {
    name: "Trần Minh Tuyên",
    github: "tuyenminhtran",
    roleTitle: "Nhóm Trưởng & Fullstack Architect",
    rpgClass: "🧙‍♂️ Level 99 Backend Archmage",
    badgeColor: "from-amber-500 to-orange-600 text-amber-200 border-amber-500/40",
    avatarSeed: "wizard",
    stats: [
      { label: "Coding Speed", value: 99 },
      { label: "System Architecture", value: 100 },
      { label: "Bug Hunter", value: 95 },
      { label: "Coffee Intake", value: 99 },
    ],
    specialMove: "🌟 Domain-Driven Architecture & VNPay Sandbox Fortress",
    quote: "Commit chuẩn chỉ, deploy tự tin, hệ thống vững như bàn thạch!",
    contributions: [
      "Kiến trúc toàn bộ RESTful API (.NET 8 + EF Core 8)",
      "Hệ thống phân quyền ChapterAccessService & Thanh toán VNPay",
      "Module Quản trị Admin Stories, Users, Categories & Transactions",
    ],
  },
  {
    name: "Lê Hoàng",
    github: "lehoanglh0533",
    roleTitle: "Quản lý Tài liệu & Sprint Planning",
    rpgClass: "🛡️ Level 98 Sprint Paladin",
    badgeColor: "from-blue-500 to-indigo-600 text-blue-200 border-blue-500/40",
    avatarSeed: "knight",
    stats: [
      { label: "Sprint Planning", value: 98 },
      { label: "Deadline Resistance", value: 96 },
      { label: "Story Management", value: 94 },
      { label: "Git Merge Precision", value: 93 },
    ],
    specialMove: "📜 Bất Bại Kế Hoạch & Sprint Velocity Maximum",
    quote: "Tài liệu chuẩn chỉ, sprint trôi chảy nhẹ nhàng như dòng sông mùa thu.",
    contributions: [
      "Soạn thảo và điều phối toàn bộ 116 Story Points / 7 Sprints",
      "Module Quản lý Truyện & Chương, kiểm duyệt thảo luận",
      "Quản trị danh sách người dùng & bảo mật tương tác",
    ],
  },
  {
    name: "Hồ Minh Tuyền",
    github: "minhtuyen006",
    roleTitle: "Chuyên gia Giao diện & Trải nghiệm Đọc",
    rpgClass: "🎨 Level 98 Frontend Mystic Rogue",
    badgeColor: "from-rose-500 to-pink-600 text-pink-200 border-pink-500/40",
    avatarSeed: "artist",
    stats: [
      { label: "Reader Experience UI", value: 99 },
      { label: "Pixel Perfection", value: 98 },
      { label: "Night Owl Stamina", value: 96 },
      { label: "Atmosphere FX", value: 97 },
    ],
    specialMove: "🌸 Bão Cánh Hoa Rơi & Trình Đọc Chống Copy Thông Minh",
    quote: "Đọc truyện là nghệ thuật, và giao diện đọc phải chạm đến từng nhịp cảm xúc!",
    contributions: [
      "Trang chủ, Chi tiết truyện và Trình đọc chương (ChapterReadPage)",
      "Chế độ đọc đa nền (Sáng/Sepia/Tối), chống sao chép bản quyền",
      "Module Xác thực JWT, Tủ sách theo dõi và Tiến độ đọc cá nhân",
    ],
  },
  {
    name: "Trần Mỹ Duyên",
    github: "duyentranmy",
    roleTitle: "Nhà Tiên Tri Dữ Liệu & Luồng Gợi Ý",
    rpgClass: "🔮 Level 97 Celestial Oracle",
    badgeColor: "from-purple-500 to-violet-600 text-purple-200 border-purple-500/40",
    avatarSeed: "oracle",
    stats: [
      { label: "PERT Network Analysis", value: 98 },
      { label: "Recommendation Logic", value: 95 },
      { label: "Transaction Auditing", value: 97 },
      { label: "Positivity & Cheer", value: 100 },
    ],
    specialMove: "⭐ Quẻ Nhân Duyên & Kết Nối Tác Phẩm Chân Ái",
    quote: "Mỗi độc giả đều xứng đáng tìm thấy cuốn sách chân ái của đời mình.",
    contributions: [
      "Phân tích sơ đồ tiến độ mạng PERT và rủi ro dự án",
      "Module Lịch sử thanh toán & Theo dõi biến động doanh thu",
      "Bộ lọc đề xuất truyện thông minh & Danh mục yêu thích",
    ],
  },
];

const SPRINT_LOGS = [
  { sprint: "Sprint 0", title: "Khởi tạo thế giới", desc: "Hạ tầng ASP.NET Core 8 Web API, PostgreSQL, Redis, Identity + JWT" },
  { sprint: "Sprint 1", title: "Cánh cổng mở lối", desc: "Trang chủ, Bộ lọc thể loại, Tìm kiếm từ khóa, Chi tiết truyện & Danh sách chương" },
  { sprint: "Sprint 2", title: "Độc quyền & Quản trị", desc: "Admin Portal, CRUD truyện/chương, Kiểm tra quyền đọc linh hoạt" },
  { sprint: "Sprint 3", title: "Dòng chảy kinh tế", desc: "Gói VIP theo tháng, Mua lẻ từng truyện, Tích hợp VNPay Sandbox" },
  { sprint: "Sprint 4", title: "Tủ sách bất diệt", desc: "Theo dõi truyện yêu thích, Lịch sử đọc, Đánh dấu chương đọc dở, Xử lý giao dịch lỗi" },
  { sprint: "Sprint 5", title: "Cộng đồng độc giả", desc: "Bình luận & thảo luận theo chương, Báo cáo kiểm duyệt nội dung, Quản trị user" },
  { sprint: "Sprint 6", title: "Đỉnh cao hoàn thiện", desc: "Trang Bảng Xếp Hạng riêng biệt, Thống kê doanh thu, Tối ưu 30+ Siêu phẩm kinh điển" },
  { sprint: "Easter Egg", title: "Phòng bí mật Nhóm 7", desc: "Mascot Mèo Jiji biến hình Totoro, Hiệu ứng hạt Canvas & Retro 8-bit Lounge!" },
];

export default function SecretCreditsPage() {
  const [likes, setLikes] = useState(() => {
    return Number(localStorage.getItem("storyreader-group7-likes")) || 77;
  });
  const [hasLiked, setHasLiked] = useState(false);
  const [scanlines, setScanlines] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Confetti burst
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#F43F5E", "#EC4899", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#F97316"];
    const count = 120;
    const pieces = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vRot;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();

    return () => cancelAnimationFrame(animId);
  };

  const handleLike = () => {
    const next = likes + 1;
    setLikes(next);
    setHasLiked(true);
    localStorage.setItem("storyreader-group7-likes", next.toString());
    play8BitSound("heart");
    triggerConfetti();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 relative overflow-x-hidden font-sans selection:bg-pink-600 selection:text-white">
      {/* Canvas Confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* CRT Scanline Toggle Overlay */}
      {scanlines && (
        <div
          className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]"
          aria-hidden="true"
        />
      )}

      {/* Glow ambient background circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-xs font-mono text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-full">
              ★ SECRET ROOM #5 ★
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScanlines(!scanlines)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                scanlines
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
              title="Bật/Tắt hiệu ứng màn hình CRT Retro"
            >
              <i className="fa-solid fa-tv mr-1.5" />
              <span>CRT Scanline: {scanlines ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => {
                play8BitSound("fanfare");
                triggerConfetti();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-md shadow-pink-500/20 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-cake-candles" />
              <span>Bung Pháo Hoa 🎉</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-4 animate-bounce">
            <i className="fa-solid fa-terminal" />
            <span>developer_lounge.exe --unlocked</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono uppercase mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-400">
              Phòng Bí Mật Nhóm 7
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Chào mừng bạn đến với căn phòng bí mật của 4 nhà phát triển đứng sau{" "}
            <span className="text-white font-semibold">StoryReader</span>. Cảm ơn bạn rất nhiều vì đã ghé thăm và đồng hành cùng đồ án!
          </p>

          {/* Key Achievements Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 font-mono text-xs">
            <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              ✔ 116/116 Story Points (100%)
            </span>
            <span className="px-3 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400">
              ✔ 35/35 User Stories
            </span>
            <span className="px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400">
              ✔ 35+ Tác phẩm Siêu phẩm
            </span>
            <span className="px-3 py-1 rounded-md bg-pink-500/10 border border-pink-500/30 text-pink-400">
              ✔ Branch: Darling
            </span>
          </div>

          {/* 8-bit Soundboard */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md">
            <span className="text-xs font-mono text-gray-400 px-2 flex items-center gap-1.5">
              <i className="fa-solid fa-volume-high text-pink-400" />
              <span>8-Bit Soundboard:</span>
            </span>
            <button
              onClick={() => play8BitSound("coin")}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono border border-amber-500/30 transition-transform active:scale-95"
            >
              🪙 Nhặt Coin
            </button>
            <button
              onClick={() => play8BitSound("jump")}
              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-transform active:scale-95"
            >
              🍄 Nhảy 8-Bit
            </button>
            <button
              onClick={() => play8BitSound("levelup")}
              className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-mono border border-sky-500/30 transition-transform active:scale-95"
            >
              🎺 Level Up!
            </button>
            <button
              onClick={() => {
                play8BitSound("fanfare");
                triggerConfetti();
              }}
              className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-mono border border-purple-500/30 transition-transform active:scale-95"
            >
              🏆 Khúc Khải Hoàn
            </button>
          </div>
        </div>

        {/* 4 Member Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl bg-gradient-to-b from-[#141824] to-[#0d101a] border border-white/10 hover:border-pink-500/40 p-6 shadow-xl transition-all hover:-translate-y-1 duration-200"
            >
              {/* Header card */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                    {member.avatarSeed === "wizard" && "🧙‍♂️"}
                    {member.avatarSeed === "knight" && "🛡️"}
                    {member.avatarSeed === "artist" && "🎨"}
                    {member.avatarSeed === "oracle" && "🔮"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                      <span>{member.name}</span>
                      <a
                        href={`https://github.com/${member.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-white text-xs transition-colors"
                        title="Xem trang GitHub cá nhân"
                      >
                        <i className="fa-brands fa-github text-sm" />
                      </a>
                    </h3>
                    <p className="text-xs text-amber-400 font-mono mt-0.5">{member.roleTitle}</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 shrink-0">
                  #{idx + 1}
                </span>
              </div>

              {/* RPG Class badge */}
              <div className="mb-4">
                <span className={`inline-block text-xs font-mono px-3 py-1 rounded-lg border bg-gradient-to-r ${member.badgeColor}`}>
                  {member.rpgClass}
                </span>
              </div>

              {/* RPG Stats Bars */}
              <div className="space-y-2 mb-4 bg-black/30 p-3 rounded-xl border border-white/5">
                {member.stats.map((st, sIdx) => (
                  <div key={sIdx} className="text-xs font-mono">
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>{st.label}</span>
                      <span className="text-pink-400 font-bold">{st.value}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 rounded-full"
                        style={{ width: `${st.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Skill */}
              <div className="text-xs font-mono bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded-xl p-2.5 mb-3">
                <span className="font-bold text-pink-400">Chiêu thức đặc biệt: </span>
                <span>{member.specialMove}</span>
              </div>

              {/* Contributions */}
              <div className="text-xs text-slate-400 space-y-1 mb-4">
                <p className="text-gray-300 font-mono text-[11px] uppercase tracking-wider font-semibold">
                  Đóng góp cốt lõi:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {member.contributions.map((c, cIdx) => (
                    <li key={cIdx} className="leading-relaxed">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quote */}
              <blockquote className="border-l-2 border-amber-400/70 pl-3 text-xs italic text-amber-200/90 font-serif">
                "{member.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Quest Log Timeline (11 Weeks / 7 Sprints) */}
        <div className="my-12 bg-[#0d101a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center text-sm font-mono font-bold">
              <i className="fa-solid fa-scroll" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-white">
                NHẬT KÝ HÀNH TRÌNH 11 TUẦN (QUEST LOG)
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Từ con số 0 đến nền tảng đọc truyện trực tuyến hoàn thiện 100%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPRINT_LOGS.map((sp, idx) => (
              <div
                key={idx}
                className="bg-black/30 border border-white/5 hover:border-white/20 rounded-xl p-3.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-amber-400">{sp.sprint}</span>
                  <i className="fa-solid fa-circle-check text-emerald-400 text-xs" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1 font-mono">{sp.title}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{sp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Like Button & Community Cheers */}
        <div className="text-center py-10 border-t border-white/10 my-8">
          <p className="text-sm font-mono text-gray-300 mb-3">
            Nếu bạn thấy thích đồ án của Nhóm 7, hãy tặng chúng mình 1 trái tim nhé!
          </p>
          <button
            onClick={handleLike}
            className={`px-6 py-3 rounded-2xl font-mono text-sm font-bold transition-all shadow-lg flex items-center gap-2 mx-auto active:scale-95 ${
              hasLiked
                ? "bg-pink-600 text-white shadow-pink-600/30 ring-2 ring-pink-400"
                : "bg-white/10 hover:bg-white/20 text-pink-400 border border-pink-500/30 hover:border-pink-500/60"
            }`}
          >
            <i className={`fa-solid fa-heart ${hasLiked ? "animate-ping" : ""}`} />
            <span>Thả Tim Cho Nhóm 7 ({likes})</span>
          </button>
          <p className="text-xs text-gray-500 font-mono mt-3">
            (Số tim được lưu cục bộ trên trình duyệt của bạn)
          </p>
        </div>

        {/* Navigation bottom */}
        <div className="flex flex-wrap items-center justify-center gap-4 pb-16">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-house" />
            <span>Về Trang Chủ</span>
          </Link>
          <Link
            to="/rankings"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs font-mono text-white font-bold transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
          >
            <i className="fa-solid fa-trophy" />
            <span>Xem Bảng Xếp Hạng</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
