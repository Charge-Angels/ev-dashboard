import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { TableActionDef, TableDef, TableFilterDef, DropdownItem } from '../../common.types';
import { ConfigService } from '../../services/config.service';
import { CentralServerService } from '../../services/central-server.service';
import { TableDataSource } from './table-data-source';
import { TableFilter } from './filters/table-filter';
import { DetailComponentContainer } from './detail-component/detail-component-container.component';
import { LocaleService } from '../../services/locale.service';

const DEFAULT_POLLING = 10000;

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataSource: TableDataSource<any>;
  public columnDefs = [];
  public columns: string[];
  public pageSizes = [];
  public searchPlaceholder = '';
  public searchSourceSubject: Subject<string> = new Subject();
  public tableDef: TableDef;
  public autoRefeshChecked = true;
  public ongoingRefresh = false;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChildren(DetailComponentContainer) detailComponentContainers: QueryList<DetailComponentContainer>;
  //  private _detailComponentId: number;
  private selection: SelectionModel<any>;
  private filtersDef: TableFilterDef[] = [];
  private actionsDef: TableActionDef[] = [];
  private actionsRightDef: TableActionDef[] = [];
  private footer = false;
  private filters: TableFilter[] = [];

  constructor(
    private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    protected localService: LocaleService,
    private dialog: MatDialog) {
    // Set placeholder
    this.searchPlaceholder = this.translateService.instant('general.search');
    //    this._detailComponentId = 0;
  }

  ngOnInit() {
    const locale = this.localService.getCurrentFullLocaleForJS();
    this.dataSource.changeLocaleTo(locale);
    if (this.configService.getCentralSystemServer().pollEnabled) {
      this.dataSource.setPollingInterval(this.configService.getCentralSystemServer().pollIntervalSecs ?
        this.configService.getCentralSystemServer().pollIntervalSecs * 1000 : DEFAULT_POLLING);
    }
    // Get Table def
    this.tableDef = this.dataSource.getTableDef();
    // Get Filters def
    this.filtersDef = this.dataSource.getTableFiltersDef();
    // Get Actions def
    this.actionsDef = this.dataSource.getTableActionsDef();
    // Get Actions Right def
    this.actionsRightDef = this.dataSource.getTableActionsRightDef();
    // Get Selection Model
    this.selection = this.dataSource.getSelectionModel();
    // Get column defs
    this.columnDefs = this.dataSource.getTableColumnDefs();
    // Get columns
    this.columns = this.columnDefs.map((column) => column.id);
    // Row Selection enabled?
    if (this.dataSource.isRowSelectionEnabled()) {
      // Yes: Add Select column
      this.columns = ['select', ...this.columns];
    }
    // Row Detailed enabled?
    if (this.dataSource.isRowDetailsEnabled()) {
      // Yes: Add Details column
      this.columns = ['details', ...this.columns];
    }
    // Is there specific row actions ?
    if (this.dataSource.hasRowActions()) {
      this.columns = [...this.columns, 'actions'];
    }
    // Paginator
    this.pageSizes = this.dataSource.getPaginatorPageSizes();
    // Find Sorted columns
    const columnDef = this.columnDefs.find((column) => column.sorted === true);
    // Found?
    if (columnDef) {
      // Yes: Set Sorting
      this.sort.active = columnDef.id;
      this.sort.direction = columnDef.direction;
    }
    // Listen to Search change
    this.searchSourceSubject.pipe(
      debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
      distinctUntilChanged()).subscribe(() => {
        // Reset paginator
        this.paginator.pageIndex = 0;
        // Load data
        this.loadData();
      }
      );
    if (this.dataSource.displayDetailsColumns.isStopped) {
      this.dataSource.displayDetailsColumns = new BehaviorSubject<boolean>(true);
    }
    // Check if detail display columns must be displayed
    this.dataSource.displayDetailsColumns.subscribe((displayDetails) => {
      if (!displayDetails) {
        // Remove details column
        const indexDetails = this.columns.findIndex((element) => element === 'details');
        if (indexDetails >= 0) {
          this.columns.splice(indexDetails, 1);
        }
      } else {
        // Add details column
        const indexDetails = this.columns.findIndex((element) => element === 'details');
        if (indexDetails === -1) {
          this.columns = ['details', ...this.columns];
        }
      }
    })
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
    // subscribe to auto-refresh
    if (this.dataSource.ongoingRefresh.isStopped) {
      this.dataSource.ongoingRefresh = new Subject();
    }
    this.dataSource.ongoingRefresh.subscribe(value =>
      this.ongoingRefresh = value
    );
    if (this.dataSource.rowRefresh.isStopped) {
      this.dataSource.rowRefresh = new Subject();
    }
    this.dataSource.rowRefresh.subscribe(row => {
      this._rowRefresh(row);
    });
  }

  ngOnDestroy() {
    // Unregister
    this.dataSource.unregisterToDataChange();
    this.dataSource.resetFilters();
    this.dataSource.ongoingRefresh.unsubscribe();
    this.dataSource.rowRefresh.unsubscribe();
    this.dataSource.displayDetailsColumns.unsubscribe()
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().length;
    return numSelected === numRows;
  }

  public filterChanged(filterDef: TableFilterDef, event) {
    // Date?
    if (filterDef.type === 'date') {
      // Date is one way binding: update the value manually
      filterDef.currentValue = event.value;
    }
    // Get Actions def
    this.dataSource.filterChanged(filterDef);
  }

  public resetDialogTableFilter(filterDef: TableFilterDef) {
    filterDef.currentValue = null;
    this.dataSource.filterChanged(filterDef)
  }

  public showDialogTableFilter(filterDef: TableFilterDef) {
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent);
    // Add sites
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        filterDef.currentValue = data;
        this.dataSource.filterChanged(filterDef)
      }
    });
  }

  public actionTriggered(actionDef: TableActionDef, event?) {
    // Slide?
    if (actionDef.type === 'slide') {
      // Slide is one way binding: update the value manually
      actionDef.currentValue = event.checked;
    }
    // Get Actions def
    this.dataSource.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    // Get Actions def
    this.dataSource.rowActionTriggered(actionDef, rowItem, dropdownItem);
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  public masterSelectToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.getData().forEach(row => this.selection.select(row));
  }

  public handleSortChanged() {
    // Reset paginator
    this.paginator.pageIndex = 0;
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  public trackByObjectId(index: number, item: any): any {
    return item ? item.id : null;
  }

  public handlePageChanged() {
    // Clear Selection
    this.selection.clear();
    // Load data
    this.loadData();
  }

  public loadData() {
    // Load data source
    this.dataSource.loadData(false);
  }

  public showHideDetailsClicked(row) {
    // Already Expanded
    if (!row.isExpanded) {
      // Already loaded?
      if (this.tableDef.rowDetails.enabled && !row[this.tableDef.rowDetails.detailsField]) {
        if (!this.tableDef.rowDetails.isDetailComponent) {
          // No: Load details from data source
          this.dataSource.getRowDetails(row).subscribe((details) => {
            // Set details
            row[this.tableDef.rowDetails.detailsField] = details;
            // No: Expand it!
            row.isExpanded = true;
          });
        } else {
          // find the container related to the row
          //          const index = this.dataSource.getRowIndex(row);
          this.detailComponentContainers.forEach((detailComponentContainer: DetailComponentContainer) => {
            if (detailComponentContainer.parentRow === row) {
              detailComponentContainer.loadComponent();
            }
          });
          row.isExpanded = true;
        }
      } else {
        // No: Expand it!
        row.isExpanded = true;
      }
    } else {
      // Fold it
      row.isExpanded = false;
    }
  }

  private _rowRefresh(compositeValue) {
    if (compositeValue) {
      const data = compositeValue.newValue['data'];
      if (data.isExpanded) {
        if (data[this.tableDef.rowDetails.detailsField]) {
          // Simple fields
          this.dataSource.getRowDetails(data).subscribe((details) => {
            // Set details
            data[this.tableDef.rowDetails.detailsField] = details;
          });
        } else {
          this.detailComponentContainers.forEach((detailComponentContainer: DetailComponentContainer) => {
            const identifierFieldname = (this.tableDef.rowFieldNameIdentifier ? this.tableDef.rowFieldNameIdentifier : 'id');
            if (detailComponentContainer.parentRow[identifierFieldname] === data[identifierFieldname]) {
              detailComponentContainer.parentRow = data;
              detailComponentContainer.refresh(data);
            }
          });
        }
      }
    }
  }


  /**
   * set*ReferenceRow
   *row, */
  public setReferenceRow(row, rowDetails) {
    rowDetails.parentRow = row;
    return true;
  }

  public onRowActionMenuOpen(action: TableActionDef, row) {
    this.dataSource.onRowActionMenuOpen(action, row);
  }

}
