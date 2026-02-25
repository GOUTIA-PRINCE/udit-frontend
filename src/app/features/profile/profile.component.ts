import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  profileMessage = '';
  passwordMessage = '';
  loading = false;

  ngOnInit() {
    const user = this.authService.getUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      lastName: [user?.lastName || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    if (user?.profilePicture) {
      this.imagePreview = 'http://localhost:3000/' + user.profilePicture;
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
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

  updateProfile() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.authService.updateProfile(this.profileForm.value, this.selectedFile || undefined).subscribe({
        next: (res) => {
          this.loading = false;
          this.profileMessage = 'Profil mis à jour avec succès !';
          this.selectedFile = null;
          if (res.user?.profilePicture) {
            this.imagePreview = 'http://localhost:3000/' + res.user.profilePicture;
          }
          setTimeout(() => this.profileMessage = '', 3000);
        },
        error: (err) => {
          this.loading = false;
          this.profileMessage = 'Erreur: ' + (err.error?.message || 'Inconnue');
        }
      });
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      this.loading = true;
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.authService.updatePassword({ currentPassword, newPassword }).subscribe({
        next: () => {
          this.loading = false;
          this.passwordMessage = 'Mot de passe modifié !';
          this.passwordForm.reset();
          setTimeout(() => this.passwordMessage = '', 3000);
        },
        error: (err) => {
          this.loading = false;
          this.passwordMessage = 'Erreur: ' + (err.error?.message || 'Inconnue');
        }
      });
    }
  }
}
