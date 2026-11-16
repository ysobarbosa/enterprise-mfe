import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InfiniteScroll } from './infinite-scroll';

// jsdom has no IntersectionObserver; this fake records observers and lets
// each test decide when the sentinel enters the viewport.
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  trigger(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  imports: [InfiniteScroll],
  template: `<div
    uiInfiniteScroll
    [uiInfiniteScrollDisabled]="disabled()"
    (reached)="reachedCount = reachedCount + 1"
  ></div>`,
})
class TestHost {
  readonly disabled = signal(false);
  reachedCount = 0;
}

describe('InfiniteScroll', () => {
  const latest = () => FakeIntersectionObserver.instances.at(-1);

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      value: FakeIntersectionObserver,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
  });

  function setup() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    return fixture;
  }

  it('observes its host element with the default margin', () => {
    const fixture = setup();

    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    expect(latest()?.observed[0]).toBe(
      (fixture.nativeElement as HTMLElement).querySelector('[uiInfiniteScroll]'),
    );
    expect(latest()?.options?.rootMargin).toBe('400px');
  });

  it('emits only when the sentinel is intersecting', () => {
    const fixture = setup();

    latest()?.trigger(false);
    expect(fixture.componentInstance.reachedCount).toBe(0);

    latest()?.trigger(true);
    expect(fixture.componentInstance.reachedCount).toBe(1);
  });

  it('stops observing while disabled and observes again when re-enabled', () => {
    const fixture = setup();
    const first = latest();

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(first?.disconnected).toBe(true);
    expect(FakeIntersectionObserver.instances).toHaveLength(1);

    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();
    expect(FakeIntersectionObserver.instances).toHaveLength(2);
  });

  it('disconnects when destroyed', () => {
    const fixture = setup();
    fixture.destroy();

    expect(latest()?.disconnected).toBe(true);
  });

  it('does nothing when IntersectionObserver is not available', () => {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;

    expect(() => setup()).not.toThrow();
  });
});
