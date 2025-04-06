import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class AuthPage implements OnInit {
  authForm: FormGroup;
  authMode: 'login' | 'signup' = 'login';
  isLoading = false;
  showPassword = false;
  errorMessage: string | null = null;
  displayName: string = '';
  
  // List of all counties in the Republic of Ireland
  counties: string[] = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 
    'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 
    'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 
    'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.authForm = this.createForm();
  }

  ngOnInit() {}

  get email() { return this.authForm.get('email'); }
  get password() { return this.authForm.get('password'); }
  get confirmPassword() { return this.authForm.get('confirmPassword'); }
  get displayNameControl() { return this.authForm.get('displayName'); }
  get countyControl() { return this.authForm.get('county'); }

  // Password validator that requires one uppercase, one lowercase, one number, and one symbol
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    
    return passwordValid ? null : {
      strongPassword: {
        hasUpperCase,
        hasLowerCase,
        hasNumeric,
        hasSpecialChar
      }
    };
  }

  createForm(): FormGroup {
    if (this.authMode === 'login') {
      return this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
    } else {
      return this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
          Validators.required, 
          Validators.minLength(8),
          this.strongPasswordValidator
        ]],
        confirmPassword: ['', [Validators.required]],
        displayName: ['', [Validators.required]],
        county: ['', [Validators.required]]
      }, { validators: this.passwordMatchValidator });
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  switchMode(mode: 'login' | 'signup') {
    if (this.authMode !== mode) {
      this.authMode = mode;
      this.authForm = this.createForm();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email, password, displayName, county } = this.authForm.value;

    try {
      if (this.authMode === 'login') {
        await this.supabaseService.signIn(email, password);
      } else {
        await this.supabaseService.signUp(email, password, county, displayName);
      }
      
      this.router.navigate(['/stats']);
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle specific Supabase error messages
      if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = this.authMode === 'login' 
          ? 'Failed to sign in. Please check your credentials.' 
          : 'Failed to create account. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async forgotPassword() {
    const email = this.email?.value;
    if (!email) {
      this.errorMessage = 'Please enter your email first';
      return;
    }

    try {
      this.isLoading = true;
      await this.supabaseService.supabase.auth.resetPasswordForEmail(email);
      this.errorMessage = null;
      alert('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Failed to send password reset email. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  dismissError() {
    this.errorMessage = null;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
