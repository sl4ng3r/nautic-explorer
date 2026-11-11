import { multiplierForTier, type FlipperTier } from './flippers';

type MovementComponent = { readonly currentValue: number; setCurrentValue(value: number): unknown };
type State = { base: number; applied: number; suspended: boolean; setAccepted?: boolean };
const same = (a: number, b: number) => Math.abs(a - b) < 0.000001;

export class MovementController {
  private states = new Map<string, State>();

  update(id: string, component: MovementComponent | undefined, inWater: boolean, tier: FlipperTier): void {
    if (!component) { this.states.delete(id); return; }
    const active = inWater && tier !== 'none';
    let state = this.states.get(id);
    if (!active) {
      if (state && !state.suspended && same(component.currentValue, state.applied)) component.setCurrentValue(state.base);
      this.states.delete(id);
      return;
    }
    if (!state) {
      state = { base: component.currentValue, applied: component.currentValue, suspended: false };
      this.states.set(id, state);
    } else if (!same(component.currentValue, state.applied)) {
      state.suspended = true;
    }
    if (state.suspended) return;
    const target = state.base * multiplierForTier(tier);
    if (!same(component.currentValue, target)) {
      const accepted = component.setCurrentValue(target);
      state.setAccepted = typeof accepted === 'boolean' ? accepted : undefined;
    }
    state.applied = component.currentValue;
  }
  inspect(id: string) {
    const state = this.states.get(id);
    return state ? { ...state } : undefined;
  }
  forget(id: string): void { this.states.delete(id); }
}
