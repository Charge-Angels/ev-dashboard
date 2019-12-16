import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  templateUrl: 'charging-stations.component.html',
})
export class ChargingStationsComponent extends AbstractTabComponent {
  isAdmin: boolean;
  constructor(
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['all', 'inerror']);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights();
  }
}
