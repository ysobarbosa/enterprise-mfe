import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `
    <button uiButton>Comprar</button>
    <a uiButton variant="outline" href="#">Ver mais</a>
  `,
})
class TestHost {}

describe('Button', () => {
  it('enhances native button and anchor elements with variant classes', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const button = element.querySelector('button');
    const anchor = element.querySelector('a');

    expect(button?.classList).toContain('ui-button--primary');
    expect(button?.textContent).toContain('Comprar');
    expect(anchor?.classList).toContain('ui-button--outline');
    expect(anchor?.classList).not.toContain('ui-button--primary');
  });
});
