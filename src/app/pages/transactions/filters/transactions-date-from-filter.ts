import { DateTableFilter } from '../../../shared/table/filters/date-filter';

export class TransactionsDateFromFilter extends DateTableFilter {
  constructor(currentValue = null) {
    super();
    const filter = this.getFilterDef();
    filter.id = 'dateFrom';
    filter.httpId = 'StartDateTime';
    filter.name = 'general.search_date_from';
    filter.currentValue = currentValue;
    filter.reset = () => filter.currentValue = currentValue;

  }
}
