import { Pipe, PipeTransform } from '@angular/core';
import { AppDecimalPipe } from './app-decimal-pipe';

@Pipe({name: 'appUnit'})
export class AppUnitPipe implements PipeTransform {

  constructor(
    private decimalPipe: AppDecimalPipe) {
  }

  private parseMeasure(measureAsString: string): Measure {
    // @ts-ignore
    if (Unit[Unit[measureAsString]] === measureAsString) {
      // @ts-ignore
      return {unit: Unit[measureAsString], size: Size.basis};
    }
    // @ts-ignore
    return {unit: Unit[measureAsString.slice(1)], size: Size[measureAsString.slice(0, 1)] as any};
  }

  transform(value: number, srcMeasure: string = '', destMeasure: string = '', withUnit: boolean = true, numberOfInteger: number = 1,
            numberOfDecimal: number = 2): string {
    if (value === 0) {
      numberOfDecimal = 0;
    }
    if (srcMeasure === destMeasure) {
      return this.decimalPipe.transform(value,
        `${numberOfInteger}.${numberOfDecimal}-${numberOfDecimal}`) + `${withUnit ? ' ' + destMeasure : ''}`;
    }
    const src = this.parseMeasure(srcMeasure);
    const dest = this.parseMeasure(destMeasure);
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
