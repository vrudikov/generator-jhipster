import { Injectable, Inject } from '@angular/core';
import { AccountService } from './account.service';
import { <%=jhiPrefixCapitalized%>TrackerService } from '../tracker/tracker.service';//Barrel doesnt work here. No idea why!

@Injectable()
export class Principal {
    private _identity: any;
    private authenticated: boolean = false;

    constructor(
        private account: AccountService<% if (websocket === 'spring-websocket') { %>,
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService<% } %>
    ){}

    authenticate (_identity) {
        this._identity = _identity;
        this.authenticated = _identity !== null;
    }

    hasAnyAuthority (authorities) {
        if (!this.authenticated || !this._identity || !this._identity.authorities) {
            return false;
        }

        for (var i = 0; i < authorities.length; i++) {
            if (this._identity.authorities.indexOf(authorities[i]) !== -1) {
                return true;
            }
        }

        return false;
    }

    hasAuthority (authority): Promise<any> {
        if (!this.authenticated) {
           return Promise.resolve(false);
        }

        return this.identity().then(id => {
            return id.authorities && id.authorities.indexOf(authority) !== -1;
        }, () => {
            return false;
        });
    }

    identity (force?: boolean): Promise<any> {
        if (force === true) {
            this._identity = undefined;
        }

        // check and see if we have retrieved the _identity data from the server.
        // if we have, reuse it by immediately resolving
        if (this._identity) {
            return Promise.resolve(this._identity);
        }

        // retrieve the _identity data from the server, update the _identity object, and then resolve.
        return this.account.get().toPromise().then(account => {
            if (account) {
                this._identity = account;
                this.authenticated = true;
                <%_ if (websocket === 'spring-websocket') { _%>
                this.trackerService.connect();
                <%_ } _%>
            } else {
                this._identity = null;
                this.authenticated = false;
            }
            return this._identity;
        }).catch(err => {
            this._identity = null;
            this.authenticated = false;
            return null;
        });
    }

    isAuthenticated (): boolean {
        return this.authenticated;
    }

    isIdentityResolved (): boolean {
        return this._identity !== undefined;
    }
}
