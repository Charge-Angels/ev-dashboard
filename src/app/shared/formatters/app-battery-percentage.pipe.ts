import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../../services/locale.service';
import { AppPercentPipe } from './app-percent-pipe';

@Pipe({ name: 'appBatteryPercentage' })
export class AppBatteryPercentagePipe implements PipeTransform {

  constructor(private percentPipe: AppPercentPipe) {
  }

  transform(initialPercentage: number, finalPercentage?: number, withEvolution = true): string | null {
    if (initialPercentage || finalPercentage) {
      let formattedMessage = this.percentPipe.transform(initialPercentage / 100, '1.0-0');
      if (finalPercentage) {
        formattedMessage += ` > ${this.percentPipe.transform(finalPercentage / 100, '1.0-0')}`;
        if (withEvolution) {
          /* Adding + sign in front of positive values */
          const pct = ((finalPercentage - initialPercentage) > 0) ?
            '+' + this.percentPipe.transform((finalPercentage - initialPercentage) / 100, '1.0-0') :
            this.percentPipe.transform((finalPercentage - initialPercentage) / 100, '1.0-0');
          formattedMessage += ` (${pct})`;
        }
      }
      return formattedMessage;
    }
    return '- %';
  }
}
