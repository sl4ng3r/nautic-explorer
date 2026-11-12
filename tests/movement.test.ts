import { swimImpulse } from '../src/domain/movement';

const swimming = { inWater: true, tier: 'basic' as const, forward: 1, view: { x: 0, y: 0, z: 1 }, velocity: { x: 0, y: 0, z: 0 }, isRiding: false };
describe('experimental swim propulsion', () => {
  it('applies smaller finite impulses to basic than diamond flippers', () => {
    const basic = swimImpulse(swimming)!;
    const diamond = swimImpulse({ ...swimming, tier: 'diamond' })!;
    expect(basic.z).toBeCloseTo(diamond.z * 0.3, 4);
    expect(diamond.z).toBeCloseTo(0.06, 4);
  });
  it('never propels without flippers, outside water, without forward input or while riding', () => {
    for (const override of [{ tier: 'none' as const }, { inWater: false }, { forward: 0 }, { forward: -1 }, { isRiding: true }]) expect(swimImpulse({ ...swimming, ...override })).toBeUndefined();
  });
  it('uses the look direction, including vertical swimming', () => {
    const upward = swimImpulse({ ...swimming, view: { x: 0, y: 1, z: 0 } })!;
    expect(upward.y).toBeGreaterThan(0);
    expect(upward.z).toBe(0);
    const downward = swimImpulse({ ...swimming, view: { x: 0, y: -1, z: 0 } })!;
    expect(downward.y).toBeLessThan(0);
  });
  it('does not boost high existing velocity or invalid vectors', () => {
    expect(swimImpulse({ ...swimming, velocity: { x: 1, y: 0, z: 0 } })).toBeUndefined();
    expect(swimImpulse({ ...swimming, view: { x: NaN, y: 0, z: 1 } })).toBeUndefined();
    expect(swimImpulse({ ...swimming, view: { x: 0, y: 0, z: 0 } })).toBeUndefined();
    expect(swimImpulse({ ...swimming, velocity: { x: 0, y: 0, z: Infinity } })).toBeUndefined();
  });
  it('limits the force near the speed cap rather than compounding velocity', () => {
    const force = swimImpulse({ ...swimming, tier: 'diamond', velocity: { x: 0, y: 0, z: 0.395 } })!;
    expect(force.z).toBeLessThanOrEqual(0.005001);
  });
});
