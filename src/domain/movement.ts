import type { FlipperTier } from './flippers';

type Vec3 = { x: number; y: number; z: number };
type SwimInput = { inWater: boolean; tier: FlipperTier; forward: number; view: Vec3; velocity: Vec3; isRiding: boolean };

// Experimental forces, not calibrated speed multipliers. Runs once per five ticks.
const FORCES = { basic: 0.015, diamond: 0.045 } as const;
const VELOCITY_CAP = 0.4;

export function swimImpulse(input: SwimInput): Vec3 | undefined {
  if (!input.inWater || input.tier === 'none' || input.isRiding || !(input.forward > 0.1)) return undefined;
  const { view, velocity } = input;
  if (![input.forward, view.x, view.y, view.z, velocity.x, velocity.y, velocity.z].every(Number.isFinite)) return undefined;
  const viewLength = Math.hypot(view.x, view.y, view.z);
  const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
  if (viewLength < 0.001 || speed >= VELOCITY_CAP) return undefined;
  const strength = Math.min(FORCES[input.tier] * Math.min(input.forward, 1), VELOCITY_CAP - speed);
  return { x: view.x / viewLength * strength, y: view.y / viewLength * strength, z: view.z / viewLength * strength };
}
