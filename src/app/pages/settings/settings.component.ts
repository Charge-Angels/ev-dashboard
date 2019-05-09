import {Component, ViewEncapsulation} from '@angular/core';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';
import {ComponentEnum, ComponentService} from '../../services/component.service';

declare const $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent extends AbstractTabComponent {
  public isOCPIActive = false;
  public isRefundActive = false;
  public isPricingActive = false;
  public isSacActive = false;

  constructor(
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['ocpi', 'refund', 'pricing', 'sac']);
    this.isOCPIActive = this.componentService.isActive(ComponentEnum.OCPI);
    this.isRefundActive = this.componentService.isActive(ComponentEnum.REFUND);
    this.isPricingActive = this.componentService.isActive(ComponentEnum.PRICING);
    this.isSacActive = this.componentService.isActive(ComponentEnum.SAC);
  }
}
