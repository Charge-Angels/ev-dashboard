import { PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from 'app/services/locale.service';

@Pipe({name: 'appPercent'})
export class AppPercentPipe implements PipeTransform {
  private percentPipe!: PercentPipe;

  constructor(
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.percentPipe = new PercentPipe(locale.currentLocaleJS);
    });
  }

  transform(value: number, digitsInfo?: string): string | null {
    return this.percentPipe.transform(value, digitsInfo);
  }
}
