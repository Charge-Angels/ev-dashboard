﻿import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CentralServerService } from '../service/central-server.service';
import { MessageService } from '../service/message.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private router: Router,
    private messageService: MessageService,
    private translateService: TranslateService,
    private centralServerService: CentralServerService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const queryParams = {};

    // Check if authenticated
    if (this.centralServerService.isAuthenticated()) {
      // logged in so return true
      return true;
    }

    // Add URL origin
    queryParams['returnUrl'] = state.url;

    // Check user/pass in URL
    const email = route.queryParams['email'];
    const password = route.queryParams['password'];
    if (email && password) {
      // Login
      this.centralServerService.login({
        'email': email,
        'password': password,
        'acceptEula': true
      }).subscribe((result) => {
        // Success
        this.centralServerService.loggingSucceeded(result.token);
        // login successful so redirect to return url
        this.router.navigate(['/']);
      }, (error) => {
        // Report the error
        this.messageService.showErrorMessage(
          this.translateService.instant('authentication.wrong_email_or_password'));
        // Naigate to login
        this.router.navigate(['/authentication/login'], { queryParams: {'email': email} });
      });
    } else {
      // Not logged in so redirect to login page with the return url
      this.router.navigate(['/authentication/login'], { queryParams });
    }
    return false;
  }
}
