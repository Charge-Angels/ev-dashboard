import {Inject, Injectable} from '@angular/core';
import {WINDOW} from '../providers/window.provider';
import {ConfigService} from './config.service';

@Injectable()
export class WindowService {

  constructor(@Inject(WINDOW) private window: Window, private configService: ConfigService) {
  }

  getHostname(): string {
    return this.window.location.hostname;
  }

  getHost(): string {
    return this.window.location.host;
  }

  getProtocol(): string {
    return this.window.location.protocol;
  }

  getPath(): string {
    return this.window.location.pathname;
  }

  getOrigin(): string {
    return this.window.location.origin;
  }

  getHash(): string {
    return this.window.location.hash.substring(1);
  }

  getSubdomain(): string {
    const subdomain = this.getHostname().split(this.configService.getFrontEnd().host)[0];
    return subdomain.split('.')[0];
  }

  getLocalStorage(): Storage {
    return this.window.localStorage;
  }

  rewriteHashUrl(): boolean {
    if (this.window.location.href.includes('/#/')) {
      const rewrittenUrl = this.window.location.href.replace('/#/', '/');
      this.window.location.replace(rewrittenUrl);
      return true;
    }
    return false;
  }

  setHash(hash: string): void {
    if (this.getHash() !== hash) {
      this.window.location.hash = hash;
    }
  }

  setSearch(query: string): void {
    if (this.getSearch() !== query) {
      if (history.pushState) {
        // tslint:disable-next-line:max-line-length
        const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}${query ? '?' + query : ''}${window.location.hash}`;
        console.log(newURL);
        window.history.pushState({path: newURL}, '' , newURL);
      } else {
        this.window.location.search = query;
      }
    }
  }

  getSearch(): string {
    return this.window.location.search.substring(1);
  }
}
