import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    authService = inject(AuthService);
    router = inject(Router);
    isSearchOpen = false;
    isDropdownOpen = false;
    isMobileMenuOpen = false;
    searchTerm = '';

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }

    logout() {
        this.authService.logout();
        this.isDropdownOpen = false;
        this.router.navigate(['/login']);
    }

    toggleSearch() {
        this.isSearchOpen = !this.isSearchOpen;
    }

    onSearch() {
        if (this.searchTerm.trim()) {
            this.router.navigate(['/'], { queryParams: { search: this.searchTerm } });
            // Optional: close search bar after search or keep it open
            this.isSearchOpen = false;
            this.closeMobileMenu();
        }
    }
}
