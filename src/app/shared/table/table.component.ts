import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatSlideToggleChange } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ConfigService } from '../../service/config.service';
import { TableDataSource } from './table-data-source';
import { TableColumnDef, TableDef, TableFilterDef } from '../../common.types';
import { Utils } from '../../utils/Utils';
import { SelectionModel } from '@angular/cdk/collections';
import { CentralServerService } from '../../service/central-server.service';
import { TableFilter } from './filters/table-filter';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataSource: TableDataSource<any>;
  public columnDefs = [];
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  private selection: SelectionModel<any>;
  private tableDef: TableDef;
  private filtersDef: TableFilterDef[] = [];
  private footer = false;
  public autoRefeshChecked = true;
  private autoRefreshSubscription: Subscription;
  private filters: TableFilter[] = [];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(
      private configService: ConfigService,
      private centralServerService: CentralServerService,
      private translateService: TranslateService) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
  }

  ngOnInit() {
    // Get Table def
    this.tableDef = this.dataSource.getTableDef();
    // Get Filters def
    this.filtersDef = this.dataSource.getTableFiltersDef();
    console.log('====================================');
    console.log(this.filtersDef);
    console.log(this.dataSource.hasFilters());
    console.log('====================================');
    // Get Actions def
    // Get Selection
    this.selection = this.dataSource.getSelectionModel();
    // Get column defs
    this.columnDefs = this.dataSource.getColumnDefs();
    this.columns = this.dataSource.getColumnDefs().map( (column) => column.id);
    // Selection enabled?
    if (this.dataSource.isLineSelectionEnabled()) {
      // Add column select
      this.columns = ['select', ...this.columns];
    }
    // Check Auto Refresh default value
    if (this.dataSource.isAutoRefreshEnabled() && this.dataSource.getAutoRefreshDefaultValue()) {
      // Listen for changes
      this.autoRefreshSubscription = this.dataSource.getAutoRefreshSubject().subscribe(() => {
        this.dataSource.loadData();
      });
    }
    // Paginator
    this.pageSizes = this.dataSource.getPaginatorPageSizes();
    // Sort
    const columnDef = this.dataSource.getColumnDefs().find((column) => column.sorted === true);
    if (columnDef) {
      // Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    // Search
    this.searchSourceSubject.pipe(
      debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
      distinctUntilChanged()).subscribe(() => {
        // Reset paginator
        this.paginator.pageIndex = 0;
        // Load data
        this.loadData();
      }
    );
  }

  ngAfterViewInit() {
    // Set Paginator
    this.dataSource.setPaginator(this.paginator);
    // Set Sort
    this.dataSource.setSort(this.sort);
    // Set Search
    this.dataSource.setSearchInput(this.searchInput);
    // Load the data
    this.loadData();
  }

  ngOnDestroy() {
    // Unregister?
    if (this.autoRefreshSubscription) {
      // Yes
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  autoRefreshChanged(slide: MatSlideToggleChange) {
    // Enabled?
    if (slide.checked) {
      // Listen for changes
      this.autoRefreshSubscription = this.dataSource.getAutoRefreshSubject().subscribe(() => {
        this.dataSource.loadData();
      });
    // Unregister?
    } else if (this.autoRefreshSubscription) {
      // Yes
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().length;
    return numSelected === numRows;
  }

  refresh() {
    // Reload
    this.dataSource.loadData();
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.getData().forEach(row => this.selection.select(row));
  }

  getRowValue(row: any, columnDef: TableColumnDef) {
    let propertyValue = row[columnDef.id];

    // Check if ID contains multiple IDs
    if (columnDef.id.indexOf('.') > 0) {
      // Yes: get the sub-property
      propertyValue = row;
      // Get the Json value
      columnDef.id.split('.').forEach((id) => {
        propertyValue = propertyValue[id];
      });
    }

    // Type?
    switch (columnDef.type) {
      // Date
      case 'date':
        propertyValue = Utils.convertToDate(propertyValue);
        break;
      // Integer
      case 'integer':
        propertyValue = Utils.convertToInteger(propertyValue);
        break;
        // Float
      case 'float':
        propertyValue = Utils.convertToFloat(propertyValue);
        break;
    }

    // Format?
    if (columnDef.formatter) {
      // Yes
      propertyValue = columnDef.formatter(propertyValue, columnDef.formatterOptions);
    }
    // Return the property
    return propertyValue;
  }

  handleSortChanged() {
    // Reset paginator
    this.paginator.pageIndex = 0;
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  handlePageChanged() {
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  loadData() {
    // Load data source
    this.dataSource.loadData();
  }

  rowClick(row) {
  }
}
