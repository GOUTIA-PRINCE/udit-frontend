import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    productService = inject(ProductService);
    route = inject(ActivatedRoute);

    allProducts: Product[] = [];
    filteredProducts: Product[] = [];
    paginatedProducts: Product[] = [];

    // Filter states
    searchTerm: string = '';
    categories: string[] = [];
    selectedCategories: { [key: string]: boolean } = {};
    maxPriceLimit: number = 1000000;
    maxPrice: number = 1000000;

    // Pagination states
    currentPage: number = 1;
    itemsPerPage: number = 9; // Default to 9 as requested
    totalPages: number = 1;

    ngOnInit() {
        this.productService.getCategories().subscribe(categories => {
            this.categories = categories;
            this.categories.forEach(cat => {
                this.selectedCategories[cat] = false;
            });
        });

        this.productService.getSettings().subscribe(settings => {
            this.maxPriceLimit = settings.maxPriceLimit;
            this.maxPrice = settings.maxPriceLimit;
        });

        this.productService.getProducts().subscribe(products => {
            this.allProducts = products;
            this.route.queryParams.subscribe(params => {
                if (params['search']) {
                    this.searchTerm = params['search'];
                }
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        this.filteredProducts = this.allProducts.filter(product => {
            // Filter by search term
            const matchesSearch = !this.searchTerm ||
                product.name.toLowerCase().includes(this.searchTerm.toLowerCase());

            // Filter by category
            const hasSelectedCategories = Object.values(this.selectedCategories).some(val => val);
            const matchesCategory = !hasSelectedCategories ||
                (product.category && this.selectedCategories[product.category]);

            // Filter by price
            const matchesPrice = product.price <= this.maxPrice;

            return matchesSearch && matchesCategory && matchesPrice;
        });

        this.currentPage = 1; // Reset to first page when filtering
        this.updatePagination();
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + Number(this.itemsPerPage);
        this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
    }

    onItemsPerPageChange() {
        this.currentPage = 1;
        this.updatePagination();
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePagination();
            // Scroll to catalog section when page changes
            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    onCategoryChange(category: string) {
        // Toggle category
        this.selectedCategories[category] = !this.selectedCategories[category];
        this.applyFilters();
    }

    hasActiveFilters(): boolean {
        return Object.values(this.selectedCategories).some(val => val);
    }

    clearCategoryFilters() {
        Object.keys(this.selectedCategories).forEach(key => {
            this.selectedCategories[key] = false;
        });
        this.applyFilters();
    }

    scrollToCatalog() {
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    onPriceInput(event: any) {
        this.maxPrice = Number(event.target.value);
        this.applyFilters();
    }

    get ngModelMaxPrice() {
        return this.maxPrice;
    }

    set ngModelMaxPrice(val: number) {
        this.maxPrice = val;
    }

    orderOnWhatsApp(product: Product) {
        const phoneNumber = '690363577';
        const message = `Bonjour, je viens de votre site pour ce produit : ${product.name}.
Prix : ${product.price} FCFA`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/237${phoneNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    }
}
