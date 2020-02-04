import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { Router } from '@angular/router';
import { RestResponse } from 'app/types/GlobalType';
import { SiteUser } from 'app/types/Site';
import { User, UserToken } from 'app/types/User';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { Utils } from '../../../utils/Utils';

@Component({
  template: `
      <div class="d-flex justify-content-center">
          <mat-checkbox class="mx-auto"
                        [disabled]="loggedUser.id === row.userID || (user && user.role !== 'B')"
                        [checked]="(row.siteAdmin ? row.siteAdmin : false) || (user && user.role === 'A')"
                        (change)="changeSiteAdmin($event)"></mat-checkbox>
      </div>`,
})
export class UserSitesAdminCheckboxComponent extends CellContentTemplateComponent implements OnInit {
  @Input() row!: SiteUser;
  public loggedUser: UserToken;
  public user!: User;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public changeSiteAdmin(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.setUserSiteAdmin(this.row, matCheckboxChange.checked);
    }
  }

  ngOnInit(): void {
    this.centralServerService.getUser(this.row.userID).subscribe((user) => {
      this.user = user;
    });
  }

  private setUserSiteAdmin(siteUser: SiteUser, siteAdmin: boolean) {
    // Set
    siteUser.siteAdmin = siteAdmin;
    // Update
    this.centralServerService.updateSiteUserAdmin(siteUser.site.id, siteUser.userID, siteAdmin).subscribe((response) => {
        if (response.status === RestResponse.SUCCESS) {
          if (siteAdmin) {
            this.messageService.showSuccessMessage('users.update_set_site_admin_success', {siteName: siteUser.site.name});
          } else {
            this.messageService.showSuccessMessage('users.update_remove_site_admin_success', {siteName: siteUser.site.name});
          }
        } else {
          siteUser.siteAdmin = !siteAdmin;
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'users.update_site_admin_role_error', {siteName: siteUser.site.name});
        }
      }, (error) => {
        siteUser.siteAdmin = !siteAdmin;
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'users.update_site_admin_role_error', {siteName: siteUser.site.name});
      },
    );
  }
}
