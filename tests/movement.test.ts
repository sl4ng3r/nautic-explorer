import { MovementController } from '../src/domain/movement';

function component(value = 0.1) {
  return { currentValue: value, setCurrentValue(next: number) { this.currentValue = next; } };
}
describe('water movement controller', () => {
  it('applies the correct tier in water, switches tiers and restores on land', () => {
    const c = component(); const controller = new MovementController();
    controller.update('p', c, true, 'basic'); expect(c.currentValue).toBeCloseTo(0.12);
    controller.update('p', c, true, 'diamond'); expect(c.currentValue).toBeCloseTo(0.3);
    controller.update('p', c, false, 'diamond'); expect(c.currentValue).toBeCloseTo(0.1);
  });
  it('restores when flippers are removed and does not boost without the component', () => {
    const c = component(); const controller = new MovementController();
    controller.update('p', c, true, 'diamond'); controller.update('p', c, true, 'none');
    expect(c.currentValue).toBeCloseTo(0.1);
    expect(() => controller.update('q', undefined, true, 'basic')).not.toThrow();
  });
  it('does not overwrite an externally changed value when stopping', () => {
    const c = component(); const controller = new MovementController();
    controller.update('p', c, true, 'basic'); c.currentValue = 0.3;
    controller.update('p', c, false, 'none'); expect(c.currentValue).toBeCloseTo(0.3);
  });
  it('leaves an externally changed value untouched while active', () => {
    const c = component(); const controller = new MovementController();
    controller.update('p', c, true, 'basic'); c.currentValue = 0.2;
    controller.update('p', c, true, 'basic'); expect(c.currentValue).toBeCloseTo(0.2);
    controller.update('p', c, false, 'none'); expect(c.currentValue).toBeCloseTo(0.2);
  });
});
