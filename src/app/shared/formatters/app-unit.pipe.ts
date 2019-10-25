import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../../services/locale.service';

@Pipe({name: 'appUnit'})
export class AppUnitPipe implements PipeTransform {
  private locale: string;
  private decimalPipe: DecimalPipe;

  constructor(private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
    this.decimalPipe = new DecimalPipe(this.locale);
  }

  _parseMeasure(measureAsString): Measure {
    if (Unit[Unit[measureAsString]] === measureAsString) {
      return {unit: Unit[measureAsString], size: Size.basis};
    }
    return {unit: Unit[measureAsString.slice(1)], size: Size[measureAsString.slice(0, 1)] as any};
  }

  transform(value: number, srcMeasure: string = '', destMeasure: string = '', withUnit: boolean = true, numberOfInteger: number = 1,
            numberOfDecimal: number = 2): any {
    if (value === 0) {
      numberOfDecimal = 0;
    }
    const src = this._parseMeasure(srcMeasure);
    const dest = this._parseMeasure(destMeasure);
    const localDestMeasure = destMeasure.replace('Wh', 'W.h');
    return this.decimalPipe.transform(value / (src.size * dest.size),
      `${numberOfInteger}.${numberOfDecimal}-${numberOfDecimal}`) + `${withUnit ? ' ' + localDestMeasure : ''}`;
  }
}

interface Measure {
  unit: string;
  size: number;
}

enum Unit {
  W,
  Wh,
}

enum Size {
  basis = 1,
  c = 10 * Size.basis,
  d = 10 * Size.c,
  k = 10 * Size.d,
  m = 10 * Size.k,
}
