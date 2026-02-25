import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private authService = inject(AuthService);

    registerForm: FormGroup;
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    errorMessage: string = '';
    loading: boolean = false;

    constructor() {
        this.registerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => this.imagePreview = reader.result as string;
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.loading = true;
            this.errorMessage = '';

            this.authService.register(this.registerForm.value, this.selectedFile || undefined).subscribe({
                next: () => {
                    this.loading = false;
                    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMessage = err.error?.message || 'Une erreur est survenue lors de l\'inscription.';
                }
            });
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
