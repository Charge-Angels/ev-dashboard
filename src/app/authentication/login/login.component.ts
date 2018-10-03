import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CentralServerService } from '../../services/central-server.service';
import { MessageService } from '../../services/message.service';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';
import { Constants } from '../../utils/Constants';
import { DialogService } from '../../services/dialog.service';
import { MatDialog } from '@angular/material';

declare var $: any;

@Component({
    selector: 'app-login-cmp',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public returnUrl: String;
    public formGroup: FormGroup;
    public email: AbstractControl;
    public password: AbstractControl;
    public acceptEula: AbstractControl;
    private messages: Object;
    public hidePassword = true;

    constructor(
            private element: ElementRef,
            private centralServerService: CentralServerService,
            private route: ActivatedRoute,
            private router: Router,
            private dialog: MatDialog,
            private dialogService: DialogService,
            private messageService: MessageService,
            private translateService: TranslateService) {

        // Set
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        // Load the tranlated messages
        this.translateService.get('authentication', {}).subscribe((messages) => {
            this.messages = messages;
        });
        // Init Form
        this.formGroup = new FormGroup({
            'email': new FormControl('',
                Validators.compose([
                    Validators.required,
                    Validators.email
                ])),
            'password': new FormControl('',
                Validators.compose([
                    Validators.required,
                    Users.passwordWithNoSpace
                ])),
            'acceptEula': new FormControl('',
                Validators.compose([
                    Validators.required
                ]))
        });
        // Get controls
        this.email = this.formGroup.controls['email'];
        this.password = this.formGroup.controls['password'];
        this.acceptEula = this.formGroup.controls['acceptEula'];
        // Check URL params
        const email = this.route.snapshot.queryParamMap.get('email');
        if (email) {
            this.email.setValue(email);
        }
    }

    ngOnInit() {
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    sidebarToggle() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        const sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible === false) {
            setTimeout(function () {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }

    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');
        body.classList.remove('off-canvas-sidebar');
    }

    login(user: Object): void {
        // Login
        this.centralServerService.login(user).subscribe((result) => {
            // Success
            this.centralServerService.loggingSucceeded(result.token);
            // login successful so redirect to return url
            this.router.navigate([this.returnUrl]);
        }, (error) => {
            // Check error code
            switch (error.status) {
                // Wrong email or password
                case 550:
                    // Report the error
                    this.messageService.showErrorMessage(this.messages['wrong_email_or_password']);
                    break;
                // Account is locked
                case 570:
                    // Report the error
                    this.messageService.showErrorMessage(this.messages['account_locked']);
                    break;
                // Account Suspended
                case 580:
                    // Report the error
                    this.messageService.showErrorMessage(this.messages['account_suspended']);
                    break;
                // Account Pending
                case 590:
                    // Report the error
                    this.messageService.showWarningMessage(this.messages['account_pending']);
                    // Create and show dialog data
                    this.dialogService.createAndShowYesNoDialog(
                        this.dialog,
                        this.translateService.instant('authentication.verify_email_title'),
                        this.translateService.instant('authentication.verify_email_resend_confirm')
                    ).subscribe((response) => {
                        // Check
                        if (response === Constants.BUTTON_TYPE_YES) {
                            // Navigate
                            this.router.navigate(['/auth/verify-email'], { queryParams: { Email: user['email'] } });
                        }
                    });
                    break;
                default:
                    // Unexpected error`
                    Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                        this.translateService.instant('general.unexpected_error_backend'));
            }
        });
    }
}
