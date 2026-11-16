import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card } from './card';

@Component({
  imports: [Card],
  template: `
    <ui-card interactive>
      <img uiCardMedia alt="Foto" src="" />
      <p>Conteúdo</p>
    </ui-card>
    <ui-card><p>Sem mídia</p></ui-card>
  `,
})
class TestHost {}

describe('Card', () => {
  it('projects media and body into their slots', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const [withMedia, withoutMedia] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('ui-card'),
    );

    expect(withMedia.querySelector('.ui-card__media img')).not.toBeNull();
    expect(withMedia.querySelector('.ui-card__body')?.textContent).toContain('Conteúdo');
    expect(withMedia.classList).toContain('ui-card--interactive');
    expect(withoutMedia.classList).not.toContain('ui-card--interactive');
  });
});
