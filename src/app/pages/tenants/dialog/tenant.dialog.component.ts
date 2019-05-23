import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {Constants} from '../../../utils/Constants';
import {ComponentEnum} from '../../../services/component.service';
import { Tenant } from 'app/common.types';

@Component({
  templateUrl: './tenant.dialog.component.html'
})
export class TenantDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public subdomain: AbstractControl;
  public email: AbstractControl;
  public components: FormGroup;
  public tenantID: string;
  private currentTenant: Tenant;

  public pricingTypes = [
    {
      key: 'convergentCharging',
      description: 'settings.pricing.convergentcharging.title'
    }, {
      key: 'simple',
      description: 'settings.pricing.simple.title'
    }
  ];

  public refundTypes = [
    {
      key: 'concur',
      description: 'settings.refund.concur.title'
    }
  ];

  public ocpiTypes = [
    {
      key: 'gireve',
      description: 'settings.ocpi.gireve.title'
    }
  ];

  public sacTypes = [
    {
      key: 'sac',
      description: 'settings.sac.sac.title'
    }
  ];

  constructor(
      private centralServerService: CentralServerService,
      private messageService: MessageService,
      private spinnerService: SpinnerService,
      private router: Router,
      protected dialogRef: MatDialogRef<TenantDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) {
    // Check if data is passed to the dialog
    if (data) {
      this.tenantID = data.id;
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      'id': new FormControl(''),
      'name': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])),
      'email': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email
        ])),
      'subdomain': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[a-z0-9]+$')
        ])),
      'components': new FormGroup({})
    });
    // Assign
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.email = this.formGroup.controls['email'];
    this.subdomain = this.formGroup.controls['subdomain'];
    this.subdomain = this.formGroup.controls['subdomain'];
    this.components = <FormGroup>this.formGroup.controls['components'];
    // Create component
    for (const componentIdentifier of Object.values(ComponentEnum)) {
      // Create controls
      this.components.addControl(componentIdentifier, new FormGroup({
        'active': new FormControl(false),
        'type': new FormControl('')
      }));
    }
// Load
    this.loadTenant();
  }

  loadTenant() {
    if (this.tenantID) {
      this.spinnerService.show();
      this.centralServerService.getTenant(this.tenantID).subscribe((tenant) => {
        this.spinnerService.hide();
        if (tenant) {
          this.currentTenant = tenant;
          // Init
          this.id.setValue(this.currentTenant.id);
          this.name.setValue(this.currentTenant.name);
          this.email.setValue(this.currentTenant.email);
          this.subdomain.setValue(this.currentTenant.subdomain);
          // Add available components
          for (const componentIdentifier of Object.values(ComponentEnum)) {
            // Set the params
            if (this.currentTenant.components && this.currentTenant.components[componentIdentifier]) {
              // Get component group
              const component = <FormGroup>this.components.controls[componentIdentifier];
              // Set Active
              component.controls.active.setValue(
                this.currentTenant.components[componentIdentifier].active === true);
              // Set Type
              component.controls.type.setValue(
                this.currentTenant.components[componentIdentifier].type);
            }
          }
        }
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'general.unexpected_error_backend');
        this.dialogRef.close();
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  save(tenant) {
    // Clear Type of inactive tenants
    for (const component in tenant.components) {
      if (tenant.components.hasOwnProperty(component)) {
        if (!tenant.components[component].active) {
          tenant.components[component].type = null;
        }
      }
    }
    if (this.currentTenant.id) {
      // update existing tenant
      this._updateTenant(tenant);
    } else {
      // create new tenant
      this._createTenant(tenant);
    }
  }

  private _createTenant(tenant) {
    this.spinnerService.show();
    this.centralServerService.createTenant(tenant).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('tenants.create_success', {'name': tenant.name});
        this.dialogRef.close(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'tenants.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'tenants.create_error');
    });
  }

  private _updateTenant(tenant) {
    this.spinnerService.show();
    this.centralServerService.updateTenant(tenant).subscribe(response => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage('tenants.update_success', {'name': tenant.name});
        this.dialogRef.close(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'tenants.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tenants.update_error');
    });
  }
}
