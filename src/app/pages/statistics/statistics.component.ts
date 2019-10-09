import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { ComponentEnum, ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
})
export class StatisticsComponent extends AbstractTabComponent {
  public isAdmin: boolean;
  public isPricingActive = false;
  constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['consumption', 'usage', 'inactivity', 'transactions', 'pricing']);
    this.isAdmin = this.authorizationService.isAdmin();
    this.isPricingActive = this.componentService.isActive(ComponentEnum.PRICING);
  }
}
