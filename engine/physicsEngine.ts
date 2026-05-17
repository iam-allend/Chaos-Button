/**
 * Physics Engine — Phase 4
 * Singleton wrapper around Matter.js.
 * Owns the Engine, World, and a registry of active bodies.
 * React components add/remove bodies via this singleton.
 *
 * Architecture:
 *  - physicsEngine.init()     → call once on mount
 *  - physicsEngine.addBody()  → add Matter.Body, get back its id
 *  - physicsEngine.getBody()  → look up body by id
 *  - physicsEngine.tick()     → advance one step (called by RAF loop)
 *  - physicsEngine.getState() → snapshot of all body positions for DOM sync
 *  - physicsEngine.destroy()  → full cleanup
 */

import Matter from "matter-js";

export interface BodyState {
  id: number;
  x: number;
  y: number;
  angle: number;
  isStatic: boolean;
  isSleeping: boolean;
}

export interface PhysicsBodyMeta {
  body: Matter.Body;
  type: "fragment" | "panel" | "floatingButton" | "wall";
  label: string;
}

class PhysicsEngineClass {
  private engine: Matter.Engine | null = null;
  private runner: Matter.Runner | null = null;
  private bodies = new Map<number, PhysicsBodyMeta>();
  private walls: Matter.Body[] = [];
  private width = 0;
  private height = 0;
  private _isInitialized = false;

  get isInitialized() { return this._isInitialized; }

  init(width: number, height: number): void {
    if (this._isInitialized) {
      this.resize(width, height);
      return;
    }

    this.width = width;
    this.height = height;

    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.2, scale: 0.001 },
      positionIterations: 6,
      velocityIterations: 4,
    });

    this._buildWalls(width, height);
    this._isInitialized = true;
  }

  private _buildWalls(width: number, height: number): void {
    if (!this.engine) return;

    // Remove old walls
    if (this.walls.length) {
      Matter.World.remove(this.engine.world, this.walls);
      this.walls = [];
    }

    const wallOpts: Matter.IBodyDefinition = {
      isStatic: true,
      friction: 0.3,
      restitution: 0.4,
      label: "wall",
    };

    const thickness = 60;
    this.walls = [
      // Floor
      Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + 100, thickness, wallOpts),
      // Left wall
      Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, wallOpts),
      // Right wall
      Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, wallOpts),
    ];

    Matter.World.add(this.engine.world, this.walls);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this._buildWalls(width, height);
  }

  /** Advance physics by one fixed timestep */
  tick(delta: number): void {
    if (!this.engine) return;
    // Cap delta to prevent spiral of death on tab blur
    const safeDelta = Math.min(delta, 32);
    Matter.Engine.update(this.engine, safeDelta);
  }

  addBody(body: Matter.Body, type: PhysicsBodyMeta["type"], label: string): number {
    if (!this.engine) return -1;
    Matter.World.add(this.engine.world, body);
    this.bodies.set(body.id, { body, type, label });
    return body.id;
  }

  removeBody(id: number): void {
    if (!this.engine) return;
    const meta = this.bodies.get(id);
    if (meta) {
      Matter.World.remove(this.engine.world, meta.body);
      this.bodies.delete(id);
    }
  }

  getBody(id: number): Matter.Body | null {
    return this.bodies.get(id)?.body ?? null;
  }

  /** Apply a force impulse to a body — used by chaos events */
  applyImpulse(id: number, forceX: number, forceY: number): void {
    const body = this.getBody(id);
    if (!body) return;
    Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
  }

  /** Snapshot all body positions — used by DOM sync layer */
  getState(): BodyState[] {
    return Array.from(this.bodies.values())
      .filter((m) => m.type !== "wall")
      .map(({ body }) => ({
        id: body.id,
        x: body.position.x,
        y: body.position.y,
        angle: body.angle,
        isStatic: body.isStatic,
        isSleeping: body.isSleeping,
      }));
  }

  /** Make a body draggable via mouse (mouse constraint) */
  addMouseConstraint(canvas: HTMLCanvasElement): Matter.MouseConstraint {
    if (!this.engine) throw new Error("Engine not initialized");
    const mouse = Matter.Mouse.create(canvas);
    const mc = Matter.MouseConstraint.create(this.engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Matter.World.add(this.engine.world, mc);
    return mc;
  }

  getBodyCount(): number {
    return this.bodies.size;
  }

  /** Set global gravity — used by chaos intensity */
  setGravity(x: number, y: number): void {
    if (!this.engine) return;
    this.engine.gravity.x = x;
    this.engine.gravity.y = y;
  }

  destroy(): void {
    if (!this.engine) return;
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
    this.engine = null;
    this.bodies.clear();
    this.walls = [];
    this._isInitialized = false;
  }
}

export const physicsEngine = new PhysicsEngineClass();

// ─── Body factory helpers ───────────────────────────────────────────

export function createFragmentBody(
  x: number,
  y: number,
  w: number,
  h: number,
  options?: Matter.IBodyDefinition
): Matter.Body {
  return Matter.Bodies.rectangle(x, y, w, h, {
    restitution: 0.5,
    friction: 0.2,
    frictionAir: 0.01,
    density: 0.002,
    ...options,
  });
}

export function createPanelBody(
  x: number,
  y: number,
  w: number,
  h: number,
  options?: Matter.IBodyDefinition
): Matter.Body {
  return Matter.Bodies.rectangle(x, y, w, h, {
    restitution: 0.3,
    friction: 0.4,
    frictionAir: 0.015,
    density: 0.005,
    ...options,
  });
}

export function createFloatingButtonBody(
  x: number,
  y: number,
  radius: number,
  options?: Matter.IBodyDefinition
): Matter.Body {
  return Matter.Bodies.circle(x, y, radius, {
    restitution: 0.7,
    friction: 0.05,
    frictionAir: 0.008,
    density: 0.001,
    ...options,
  });
}