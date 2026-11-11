import type { FlipperTier } from './flippers';
export type SwimSample = {
  tick: number; position: { x: number; y: number; z: number }; dimension: string;
  inWater: boolean; swimming: boolean; sprinting: boolean; movement?: number;
  tier: FlipperTier; boostActive?: boolean; boostError?: boolean;
};

// Only holds the bounded ten-second diagnostic run, never an ongoing history.
export class SwimProbe {
  private samples: SwimSample[] = [];
  record(sample: SwimSample): void { if (this.samples.length < 201) this.samples.push(sample); }
  result() {
    const first = this.samples[0], last = this.samples[this.samples.length - 1];
    const elapsedTicks = first && last ? last.tick - first.tick : 0;
    let distance = 0;
    for (let i = 1; i < this.samples.length; i++) {
      const a = this.samples[i - 1], b = this.samples[i];
      if (a.dimension === b.dimension) distance += Math.hypot(b.position.x - a.position.x, b.position.z - a.position.z);
    }
    const values = this.samples.flatMap(s => s.movement === undefined ? [] : [s.movement]);
    const heights = this.samples.map(s => s.position.y);
    return {
      elapsedTicks, horizontalSpeed: elapsedTicks > 0 ? distance / (elapsedTicks / 20) : 0,
      boostActiveSamples: this.samples.filter(s => s.boostActive).length,
      boostErrorSamples: this.samples.filter(s => s.boostError).length,
      swimmingSamples: this.samples.filter(s => s.swimming).length,
      sprintingSamples: this.samples.filter(s => s.sprinting).length,
      sampleCount: this.samples.length,
      movementMin: values.length ? Math.min(...values) : undefined,
      movementMax: values.length ? Math.max(...values) : undefined,
      verticalRange: heights.length ? Math.max(...heights) - Math.min(...heights) : 0,
      tier: first?.tier, tierChanged: this.samples.some(s => s.tier !== first?.tier),
      invalidReason: !elapsedTicks ? 'insufficient samples' : this.samples.some(s => s.dimension !== first.dimension) ? 'dimension changed' : this.samples.some(s => !s.inWater) ? 'left water' : undefined,
      first, last,
    };
  }
}

type PositionSample = Pick<SwimSample, 'tick' | 'position' | 'dimension'>;
export function horizontalSpeedBetween(a: PositionSample, b: PositionSample): number | undefined {
  if (a.dimension !== b.dimension || b.tick <= a.tick) return undefined;
  return Math.hypot(b.position.x - a.position.x, b.position.z - a.position.z) * 20 / (b.tick - a.tick);
}
