import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export type AtmosphereType = "none" | "sakura" | "fireflies" | "rain" | "stars";

interface AtmosphericOverlayProps {
  type: AtmosphereType;
}

export default function AtmosphericOverlay({ type }: AtmosphericOverlayProps) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (type === "none" || isAdmin) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // ==========================================
    // 1. CÁNH HOA ANH ĐÀO (SAKURA)
    // ==========================================
    const petalCount = 42;
    const petals = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 9,
      speedX: Math.random() * 1.5 - 0.5,
      speedY: Math.random() * 1.5 + 1.2,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 2 - 1,
      sway: Math.random() * 2 + 1,
      swaySpeed: Math.random() * 0.02 + 0.01,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.6,
    }));

    // ==========================================
    // 2. ĐOM ĐÓM (FIREFLIES)
    // ==========================================
    const fireflyCount = 35;
    const fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 2,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      alpha: Math.random(),
      fadeSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
      glow: Math.random() * 12 + 10,
    }));

    // ==========================================
    // 3. MƯA RẢ RÍCH (COZY RAIN)
    // ==========================================
    const dropCount = 75;
    const raindrops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 18 + 14,
      speed: Math.random() * 8 + 12,
      opacity: Math.random() * 0.35 + 0.15,
      thickness: Math.random() * 0.8 + 0.6,
    }));

    // ==========================================
    // 4. SAO BĂNG & BỤI SAO (STARS)
    // ==========================================
    const staticStarCount = 60;
    const staticStars = Array.from({ length: staticStarCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      twinkle: Math.random() * 0.02 + 0.005,
    }));

    let shootingStar: {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    } | null = null;

    let lastShootingTime = Date.now();

    // ==========================================
    // VÒNG LẶP RENDER CHÍNH (60 FPS)
    // ==========================================
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // --- RENDER HOA ANH ĐÀO ---
      if (type === "sakura") {
        for (const p of petals) {
          p.angle += p.swaySpeed;
          p.x += Math.sin(p.angle) * p.sway + p.speedX;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;

          // Vẽ cánh hoa hình elip uốn lượn
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, -p.size / 4, p.size, p.size / 2);
          ctx.bezierCurveTo(p.size, p.size, p.size / 2, p.size * 1.2, 0, p.size);
          ctx.bezierCurveTo(-p.size / 2, p.size * 1.2, -p.size, p.size, -p.size, p.size / 2);
          ctx.bezierCurveTo(-p.size, -p.size / 4, -p.size / 2, -p.size / 2, 0, 0);

          // Gradient hồng phấn ngọt ngào
          const grad = ctx.createLinearGradient(0, 0, p.size, p.size);
          grad.addColorStop(0, "rgba(255, 183, 197, 0.95)");
          grad.addColorStop(0.5, "rgba(255, 133, 162, 0.85)");
          grad.addColorStop(1, "rgba(255, 192, 203, 0.9)");
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        }
      }

      // --- RENDER ĐOM ĐÓM ---
      else if (type === "fireflies") {
        for (const f of fireflies) {
          f.x += f.vx;
          f.y += f.vy;
          f.alpha += f.fadeSpeed;

          if (f.alpha >= 1) {
            f.alpha = 1;
            f.fadeSpeed = -Math.abs(f.fadeSpeed);
          } else if (f.alpha <= 0.1) {
            f.alpha = 0.1;
            f.fadeSpeed = Math.abs(f.fadeSpeed);
          }

          if (f.x < 0) f.x = width;
          if (f.x > width) f.x = 0;
          if (f.y < 0) f.y = height;
          if (f.y > height) f.y = 0;

          ctx.save();
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);

          // Vầng hào quang phát sáng vàng kim
          const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glow);
          glow.addColorStop(0, `rgba(254, 240, 138, ${f.alpha})`);
          glow.addColorStop(0.3, `rgba(250, 204, 21, ${f.alpha * 0.7})`);
          glow.addColorStop(0.8, `rgba(234, 179, 8, ${f.alpha * 0.2})`);
          glow.addColorStop(1, "rgba(234, 179, 8, 0)");

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.glow, 0, Math.PI * 2);
          ctx.fill();

          // Nhân sáng tâm đom đóm
          ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // --- RENDER MƯA RẢ RÍCH ---
      else if (type === "rain") {
        ctx.strokeStyle = "rgba(186, 230, 253, 0.4)";
        for (const drop of raindrops) {
          drop.y += drop.speed;
          drop.x += drop.speed * 0.2; // Mưa rơi hơi chéo

          if (drop.y > height) {
            drop.y = -20;
            drop.x = Math.random() * (width + 100) - 50;
          }

          ctx.save();
          ctx.lineWidth = drop.thickness;
          ctx.globalAlpha = drop.opacity;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.length * 0.2, drop.y + drop.length);
          ctx.stroke();
          ctx.restore();
        }
      }

      // --- RENDER SAO BĂNG & BỤI SAO ---
      else if (type === "stars") {
        // Bụi sao nhấp nháy
        for (const s of staticStars) {
          s.alpha += s.twinkle;
          if (s.alpha > 0.95 || s.alpha < 0.2) s.twinkle = -s.twinkle;

          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha)})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(192, 132, 252, 0.8)";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Tạo sao băng ngẫu nhiên mỗi 3-6 giây
        const now = Date.now();
        if (!shootingStar && now - lastShootingTime > Math.random() * 3000 + 3000) {
          shootingStar = {
            x: Math.random() * (width * 0.8),
            y: Math.random() * (height * 0.4),
            length: Math.random() * 120 + 100,
            speed: Math.random() * 15 + 18,
            angle: Math.PI / 4,
            opacity: 1,
            active: true,
          };
          lastShootingTime = now;
        }

        // Vẽ vệt sao băng
        if (shootingStar && shootingStar.active) {
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          shootingStar.opacity -= 0.02;

          ctx.save();
          const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
          const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

          const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
          grad.addColorStop(0, "rgba(255, 255, 255, 0)");
          grad.addColorStop(0.7, `rgba(192, 132, 252, ${shootingStar.opacity * 0.5})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.opacity})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shootingStar.x, shootingStar.y);
          ctx.stroke();

          // Đầu sao băng chói sáng
          ctx.fillStyle = `rgba(255, 255, 255, ${shootingStar.opacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(255, 255, 255, 1)";
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
            shootingStar = null;
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [type]);

  if (type === "none") return null;

  if (isAdmin) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-700"
      style={{ opacity: 1 }}
    />
  );
}
