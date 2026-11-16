import { Directive, effect, ElementRef, inject, input, output } from '@angular/core';

// Emits `reached` when the host element (a sentinel at the end of a list)
// gets close to the viewport. It only detects; deciding what to load is the
// consumer's job.
@Directive({
  selector: '[uiInfiniteScroll]',
})
export class InfiniteScroll {
  readonly disabled = input(false, { alias: 'uiInfiniteScrollDisabled' });
  readonly margin = input('400px', { alias: 'uiInfiniteScrollMargin' });
  readonly reached = output<void>();

  constructor() {
    const element = inject<ElementRef<Element>>(ElementRef).nativeElement;

    // A new observer is created whenever the directive is re-enabled. Its first
    // callback reports the current state, so a sentinel that is still visible
    // after a page loads triggers the next load without the user scrolling.
    effect((onCleanup) => {
      if (this.disabled() || typeof IntersectionObserver === 'undefined') {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.reached.emit();
          }
        },
        { rootMargin: this.margin() },
      );
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    });
  }
}
