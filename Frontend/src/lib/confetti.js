/**
 * Lightweight zero-dependency canvas confetti burst
 */
export const triggerConfetti = () => {
    if (typeof window === "undefined") return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ["#22c55e", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];
    const pieces = Array.from({ length: 65 }).map(() => ({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 - 50,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        alpha: 1,
    }));

    let frameId;
    const render = () => {
        ctx.clearRect(0, 0, width, height);
        let active = 0;

        pieces.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.vx *= 0.98;
            p.rotation += p.vRot;
            p.alpha -= 0.012;

            if (p.alpha > 0) {
                active++;
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
                ctx.restore();
            }
        });

        if (active > 0) {
            frameId = requestAnimationFrame(render);
        } else {
            cancelAnimationFrame(frameId);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };

    frameId = requestAnimationFrame(render);
};

export default triggerConfetti;

