import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from 'app/services/config.service';
import { WindowService } from 'app/services/window.service';
import { RestResponse } from 'app/types/GlobalType';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { CentralServerService } from '../../services/central-server.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { ParentErrorStateMatcher } from '../../utils/ParentStateMatcher';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-authentication-define-password',
  templateUrl: './authentication-define-password.component.html',
})

export class AuthenticationDefinePasswordComponent implements OnInit, OnDestroy {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  public formGroup: FormGroup;
  public resetPasswordHash!: string|null;
  public passwords: FormGroup;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public hidePassword = true;
  public hideRepeatPassword = true;
  public mobileVendor!: string;

  private siteKey: string;

  constructor(
      private centralServerService: CentralServerService,
      private router: Router,
      private route: ActivatedRoute,
      private spinnerService: SpinnerService,
      private messageService: MessageService,
      private reCaptchaV3Service: ReCaptchaV3Service,
      private windowService: WindowService,
      private configService: ConfigService,
      private translateService: TranslateService) {
    // Get the Site Key
    this.siteKey = this.configService.getUser().captchaSiteKey;
    // Init Form
    this.formGroup = new FormGroup({
      passwords: new FormGroup({
        password: new FormControl('',
          Validators.compose([
            Validators.required,
            Users.passwordWithNoSpace,
            Users.validatePassword,
          ])),
        repeatPassword: new FormControl('',
          Validators.compose([
            Validators.required,
          ])),
      },
      // @ts-ignore
      (passwordFormGroup: FormGroup) => {
        return Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword');
      }),
    });
    // Form
    this.passwords = (this.formGroup.controls['passwords'] as FormGroup);
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.resetPasswordHash = this.route.snapshot.queryParamMap.get('hash');
    // Handle Deep Linking
    if (Utils.isInMobileApp()) {
        // Forward to Mobile App
      const mobileAppURL: string = Utils.buildMobileAppDeepLink(
        `resetPassword/${this.windowService.getSubdomain()}/${this.resetPasswordHash}`);
      window.location.href = mobileAppURL;
    }
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('lock-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(() => {
      // After 1000 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  resetPassword(data: any) {
    this.reCaptchaV3Service.execute(this.siteKey, 'ResetPassword', (token) => {
      if (token) {
        data['captcha'] = token;
      } else {
        this.messageService.showErrorMessage('general.invalid_captcha_token');
        return;
      }
      data['hash'] = this.resetPasswordHash;
      // Show
      this.spinnerService.show();
      // Yes: Update
      this.centralServerService.resetUserPassword(data).subscribe((response) => {
        // Hide
        this.spinnerService.hide();
        // Success
        if (response.status && response.status === RestResponse.SUCCESS) {
          // Show message`
          this.messageService.showSuccessMessage('authentication.define_password_success');
          // Go back to login
          this.router.navigate(['/auth/login']);
          // Unexpected Error
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'authentication.define_password_error');
        }
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        // Check status error code
        switch (error.status) {
          // Hash no longer valid
          case 550:
            this.messageService.showErrorMessage('authentication.define_password_hash_not_valid');
            break;
          // Unexpected error`
          default:
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
        }
      });
    });
  }
}
