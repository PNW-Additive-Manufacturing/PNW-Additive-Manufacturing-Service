import { useEffect, useRef } from "react";

class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public scale(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    public add(other: Vector2): Vector2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
}

interface ConfettiParticle {
    velocity: Vector2;
    position: Vector2;
    angle: number;
    angularVelocity: number;
    color: string;
    size: number;
}

const confettiColors = ["gray", "#b1810b"];

export default function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<ConfettiParticle[]>([]);  // Use ref to store particles to avoid re-renders

    useEffect(() => {
        let animationFrameId: number;

        if (canvasRef.current == null) return;

        // Resize the Canvas based on its container
        const resizeCanvas = () => {
            if (canvasRef.current) {
                const canvasRatio = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
                canvasRef.current.width = 480;
                canvasRef.current.height = 480 / canvasRatio;
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const context2D = canvasRef.current?.getContext("2d");
        if (!context2D) return;

        context2D.imageSmoothingEnabled = true;

        // Setup initial particles
        const initParticles = () => {
            const newParticles: ConfettiParticle[] = [];
            for (let i = 0; i < 75; i++) {
                const velocity = new Vector2(Math.random() * 7 - 2, Math.random() * -8 - 2);
                newParticles.push({
                    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                    position: new Vector2(Math.random() * canvasRef.current!.width, canvasRef.current!.height + Math.random() * 100),
                    size: Math.random() * 10 + 3,
                    velocity,
                    angle: Math.random() * Math.PI,
                    angularVelocity: velocity.x * (Math.PI / 40),
                });
            }
            particlesRef.current = newParticles;
        };

        initParticles(); // Initialize the particles

        let lastRendered = performance.now();

        const render = (time: DOMHighResTimeStamp) => {
            const delta = (time - lastRendered) / (1000 / 60); // Calculate delta time for smooth animation

            // Clear the canvas
            context2D.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

            // Create a copy of the particles array and update particle positions
            const updatedParticles = particlesRef.current.map((particle) => {
                // Save the current state
                context2D.save();

                // Translate to the particle's position
                context2D.translate(particle.position.x, particle.position.y);

                // Rotate around the particle's center
                context2D.rotate(particle.angle);

                // Set the fill color and draw the rotated rectangle
                context2D.fillStyle = particle.color;
                context2D.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);

                // Restore the context state
                context2D.restore();

                // Apply gravity and update the particle's position
                particle.velocity.y += 0.1; // Simulate gravity
                particle.angle += particle.angularVelocity * delta;
                particle.position.add(particle.velocity.scale(delta));

                return particle; // Return the updated particle
            });

            // Filter out particles that have moved out of the view
            particlesRef.current = updatedParticles.filter((p) => p.position.y < canvasRef.current!.height * 2);

            lastRendered = time;

            // Continue animation if there are still particles
            if (particlesRef.current.length > 0) {
                animationFrameId = window.requestAnimationFrame(render);
            } else {
                console.debug("Confetti DONE!");
            }
        };

        animationFrameId = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resizeCanvas); // Clean up the resize event listener
        };
    }, []); // Run once

    return <canvas ref={canvasRef} className="w-full h-full" />;
}
