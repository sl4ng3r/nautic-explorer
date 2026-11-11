import { SwimProbe } from '../src/domain/swim-probe';

describe('swim probe', () => {
  const sample = (tick: number, x: number, extra = {}) => ({ tick, position: { x, y: 10, z: 0 }, dimension: 'overworld', inWater: true, swimming: true, sprinting: true, movement: 0.3, tier: 'diamond' as const, suspended: false, ...extra });
  it('measures displacement per simulation second and reports controller suspension', () => {
    const probe = new SwimProbe();
    probe.record(sample(100, 0));
    probe.record(sample(200, 20, { suspended: true }));
    const result = probe.result();
    expect(result.horizontalSpeed).toBeCloseTo(4);
    expect(result.elapsedTicks).toBe(100);
    expect(result.suspendedSamples).toBe(1);
    expect(result.swimmingSamples).toBe(2);
    expect(result.movementMin).toBe(0.3);
  });
  it('rejects dimension changes and samples outside water instead of reporting a misleading speed', () => {
    const probe = new SwimProbe();
    probe.record(sample(0, 0));
    probe.record(sample(20, 4, { dimension: 'nether', inWater: false }));
    expect(probe.result().invalidReason).toBeTruthy();
  });
  it('reports tier changes, vertical drift and movement range', () => {
    const probe = new SwimProbe();
    probe.record(sample(0, 0));
    probe.record(sample(20, 4, { tier: 'none', movement: 0.1, position: { x: 4, y: 12, z: 0 } }));
    expect(probe.result().tierChanged).toBe(true);
    expect(probe.result().verticalRange).toBe(2);
    expect(probe.result().movementMin).toBe(0.1);
  });
});

describe('live speed reading', () => {
  it('calculates horizontal displacement speed and rejects dimension changes and zero duration', async () => {
    const { horizontalSpeedBetween } = await import('../src/domain/swim-probe');
    const a = { tick: 0, dimension: 'overworld', position: { x: 0, y: 0, z: 0 } };
    expect(horizontalSpeedBetween(a, { ...a, tick: 10, position: { x: 2, y: 3, z: 0 } })).toBeCloseTo(4);
    expect(horizontalSpeedBetween(a, { ...a, tick: 10, dimension: 'nether' })).toBeUndefined();
    expect(horizontalSpeedBetween(a, a)).toBeUndefined();
  });
});
