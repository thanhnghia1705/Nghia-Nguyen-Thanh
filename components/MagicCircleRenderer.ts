
import { Point } from "../types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

export class MagicCircleRenderer {
  private rotation: number = 0;
  private particles: Particle[] = [];
  private lastTime: number = 0;

  draw(
    ctx: CanvasRenderingContext2D,
    center: Point,
    radius: number,
    color: string = "#fb923c",
    opacity: number = 1
  ) {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.rotation += 0.015;

    // Use additive blending for "glow" effect
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    this.updateParticles(center, radius, dt);
    this.drawParticles(ctx, color);

    ctx.translate(center.x, center.y);
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;

    // 1. Outer Runes Ring (Slower rotation)
    ctx.save();
    ctx.rotate(-this.rotation * 0.4);
    this.drawRuneRing(ctx, radius + 20, 16, color);
    ctx.restore();

    // 2. Main Circle
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Nested Inner Patterns
    ctx.save();
    ctx.rotate(this.rotation);
    
    // Octagram
    ctx.lineWidth = 2;
    this.drawPolygon(ctx, 0, 0, radius * 0.95, 4, 0);
    this.drawPolygon(ctx, 0, 0, radius * 0.95, 4, Math.PI / 4);
    
    // Inner small ring with dots
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Spoke lines
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(radius * 0.2, 0);
      ctx.rotate(angle);
      ctx.lineTo(radius * 0.9, 0);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Core pulsing center
    const pulse = Math.sin(now * 0.005) * 5;
    ctx.beginPath();
    ctx.arc(0, 0, (radius * 0.15) + pulse, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3 * opacity;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private updateParticles(center: Point, radius: number, dt: number) {
    // Emit new particles from the ring
    if (Math.random() > 0.3) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        life: 1.0,
        size: Math.random() * 3 + 1
      });
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 20;
      p.y += p.vy * dt * 20;
      p.life -= dt * 1.5;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D, color: string) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPolygon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, sides: number, rotation: number) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = rotation + (i * 2 * Math.PI) / sides;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private drawRuneRing(ctx: CanvasRenderingContext2D, radius: number, count: number, color: string) {
    ctx.lineWidth = 1;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(radius, 0);
      
      // Draw a "rune" (abstract glyph)
      ctx.beginPath();
      ctx.moveTo(-5, -8);
      ctx.lineTo(5, 0);
      ctx.lineTo(-5, 8);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    }
  }
}
