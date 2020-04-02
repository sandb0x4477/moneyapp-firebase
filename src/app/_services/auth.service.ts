import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth, User } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(public afAuth: AngularFireAuth) {
    this.user$ = this.afAuth.authState.pipe(
      tap(user => console.log(user)),
      switchMap(user => {
        // Logged in
        if (user) {
          return of(user);
        } else {
          // Logged out
          return of(null);
        }
      }),
    );
  }

  loginWithEmail(creds: { email: string; password: string }): Promise<auth.UserCredential> {
    console.log('TC: AuthService -> creds', creds);
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(creds.email, creds.password).then(
        userCreds => resolve(userCreds),
        err => reject(err),
      );
    });
  }

  async signOut() {
    await this.afAuth.auth.signOut();
    // this.router.navigate(['/']);
  }
}
