import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss'
})
export class ContactComponent {
    private fb = inject(FormBuilder);
    private contactService = inject(ContactService);

    contactForm: FormGroup;
    submitted = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    constructor() {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            subject: ['', Validators.required],
            message: ['', [Validators.required, Validators.minLength(10)]]
        });
    }

    onSubmit() {
        if (this.contactForm.valid) {
            this.submitted = true;
            this.successMessage = null;
            this.errorMessage = null;

            this.contactService.sendMessage(this.contactForm.value).subscribe({
                next: () => {
                    this.contactForm.reset();
                    this.submitted = false;
                    this.successMessage = 'Votre message a été envoyé avec succès !';
                    // Effacer le message après 5 secondes
                    setTimeout(() => this.successMessage = null, 5000);
                },
                error: (err) => {
                    this.submitted = false;
                    this.errorMessage = 'Une erreur est survenue lors de l\'envoi du message. Vérifiez que le serveur est bien lancé.';
                    console.error('Contact error:', err);
                }
            });
        }
    }
}
