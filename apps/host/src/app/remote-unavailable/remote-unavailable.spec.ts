import { TestBed } from '@angular/core/testing';
import { RemoteUnavailable } from './remote-unavailable';

describe('RemoteUnavailable', () => {
  it('explains the problem and offers a retry', () => {
    const fixture = TestBed.createComponent(RemoteUnavailable);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.querySelector('button')?.textContent).toContain('Tentar de novo');
  });
});
