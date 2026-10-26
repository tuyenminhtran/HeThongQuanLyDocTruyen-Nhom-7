import confetti from "canvas-confetti";

export function fireConfetti() {
  // Đợt 1: Bắn từ giữa lên
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#D97706", "#FDE68A", "#10B981", "#3B82F6", "#EC4899"],
  });

  // Đợt 2: Bắn hai bên cánh gà sau 250ms
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#D97706", "#FDE68A", "#F59E0B"],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#D97706", "#FDE68A", "#10B981"],
    });
  }, 250);
}
