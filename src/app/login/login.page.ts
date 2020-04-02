import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../_services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isDebug = environment.debug;

  constructor(private router: Router, private fb: FormBuilder, public auth: AuthService) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: [environment.email || '', Validators.required],
      password: [environment.password || '', Validators.required],
    });
  }

  onLoginWithEmail() {
    console.log('TC: LoginPage -> onLoginWithEmail -> ', this.loginForm.value);
    this.auth
      .loginWithEmail(this.loginForm.value)
      .then(() => this.router.navigate(['/']))
      .catch(err => {
        const errorCode = err.code;
        const errorMessage = err.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(err);
      });
  }

  onLogout() {
    this.auth.signOut();
  }
}
