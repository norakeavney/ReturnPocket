import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

/**
 * Authentication component handling user login and registration
 * Provides form validation, error handling, and authentication state management
 */
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
  /** Main form group for authentication */
  authForm: FormGroup;
  
  /** Current authentication mode (login or signup) */
  authMode: 'login' | 'signup' = 'login';
  
  /** Loading state indicator for async operations */
  isLoading = false;
  
  /** Toggle for password visibility */
  showPassword = false;
  
  /** Error message to display to the user */
  errorMessage: string | null = null;
  
  /** User's display name */
  displayName: string = '';
  
  /** List of counties in the Republic of Ireland for user selection */
  counties: string[] = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 
    'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 
    'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 
    'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
  ];

  /**
   * Constructor initializes services and creates the authentication form
   * 
   * @param fb - Form builder for creating reactive forms
   * @param router - Router for navigation
   * @param supabaseService - Service handling Supabase authentication
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.authForm = this.createForm();
  }

  /** Angular lifecycle hook, runs after component initialization */
  ngOnInit() {}

  /** Getter for email form control */
  get email() { return this.authForm.get('email'); }
  
  /** Getter for password form control */
  get password() { return this.authForm.get('password'); }
  
  /** Getter for confirmPassword form control */
  get confirmPassword() { return this.authForm.get('confirmPassword'); }
  
  /** Getter for displayName form control */
  get displayNameControl() { return this.authForm.get('displayName'); }
  
  /** Getter for county form control */
  get countyControl() { return this.authForm.get('county'); }

  /**
   * Custom validator for password strength requirements
   * Checks for uppercase, lowercase, numeric and special characters
   * 
   * @param control - The form control to validate
   * @returns ValidationErrors object if invalid, null if valid
   */
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

  /**
   * Creates the appropriate form group based on current auth mode
   * Login form includes email and password
   * Signup form includes additional fields for registration
   * 
   * @returns FormGroup configured for the current auth mode
   */
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

  /**
   * Validator function that ensures password and confirmPassword fields match
   * 
   * @param control - The form group containing the password fields
   * @returns ValidationErrors object if passwords don't match, null if valid
   */
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

  /**
   * Switches between login and signup modes
   * Recreates the form with appropriate fields for the selected mode
   * 
   * @param mode - The auth mode to switch to ('login' or 'signup')
   */
  switchMode(mode: 'login' | 'signup') {
    if (this.authMode !== mode) {
      this.authMode = mode;
      this.authForm = this.createForm();
    }
  }

  /** Toggles password field visibility between plain text and masked */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles form submission for both login and signup
   * Validates form, processes authentication, and handles errors
   */
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

  /**
   * Initiates password reset process for the user
   * Sends password reset email through Supabase
   */
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

  /** Clears any displayed error messages */
  dismissError() {
    this.errorMessage = null;
  }

  /** Navigates back to the previous screen */
  goBack() {
    this.router.navigate(['/']);
  }
}
