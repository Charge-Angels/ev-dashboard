import { TableDataSource } from '../../../shared/table/table-data-source';
import { Site, User, TableDef, TableColumnDef } from '../../../common.types';
import { DataSource } from '@angular/cdk/table';
import { MessageService } from '../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CentralServerService } from '../../../services/central-server.service';
import { Utils } from '../../../utils/Utils';

export class UserSitesDataSource extends TableDataSource<Site> implements DataSource<Site> {
    private user: User;

    constructor(
            private messageService: MessageService,
            private translateService: TranslateService,
            private router: Router,
            private centralServerService: CentralServerService) {
        super();
    }

    loadData() {
        // User provided?
        if (this.user) {
            // Yes: Get data
            this.centralServerService.getSites(this.getFilterValues(),
                this.getPaging(), this.getOrdering()).subscribe((sites) => {
                    // Set number of records
                    this.setNumberOfRecords(sites.count);
                    // Update page length (number of sites is in User)
                    this.updatePaginator();
                    // Return sites
                    this.getDataSubjet().next(sites.result);
                    // Keep it
                    this.setData(sites.result);
                }, (error) => {
                    // No longer exists!
                    Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                        this.translateService.instant('general.error_backend'));
                });
        } else {
            // Update page length
            this.updatePaginator();
            // Return sites
            this.getDataSubjet().next([]);
        }
    }

    getTableDef(): TableDef {
        return {
            lineSelection: {
                enabled: true,
                multiple: true
            },
            search: {
                enabled: true
            }
        };
    }

    getTableColumnDefs(): TableColumnDef[] {
        // As sort directive in table can only be unset in Angular 7, all columns will be sortable
        return [
            {
                id: 'name',
                name: this.translateService.instant('sites.name'),
                class: 'text-left site-col-name',
                sorted: true,
                direction: 'asc'
            },
            {
                id: 'address.city',
                name: this.translateService.instant('general.city'),
                class: 'text-left col-city'
            },
            {
                id: 'address.country',
                name: this.translateService.instant('general.country'),
                class: 'text-left col-country'
            }
        ];
    }

    setUser(user: User) {
        // Set user
        this.user = user;
    }
}
