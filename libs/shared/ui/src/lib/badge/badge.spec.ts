import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge, BadgeTone } from './badge';

@Component({
  imports: [Badge],
  template: `<ui-badge [tone]="tone()">Disponível</ui-badge>`,
})
class TestHost {
  readonly tone = signal<BadgeTone>('neutral');
}

describe('Badge', () => {
  it('projects its label and exposes the tone as a data attribute', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const badge = (fixture.nativeElement as HTMLElement).querySelector('ui-badge');

    expect(badge?.textContent).toContain('Disponível');
    expect(badge?.getAttribute('data-tone')).toBe('neutral');

    fixture.componentInstance.tone.set('warning');
    fixture.detectChanges();

    expect(badge?.getAttribute('data-tone')).toBe('warning');
  });
});
