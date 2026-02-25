import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { AdminService } from '../../core/services/admin.service';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
    private productService = inject(ProductService);
    private adminService = inject(AdminService);
    authService = inject(AuthService);

    products: Product[] = [];
    users: any[] = [];
    messages: any[] = [];
    activeTab: 'products' | 'users' | 'messages' | 'settings' = 'products';
    showModal = false;
    showUserModal = false;
    showCategoryModal = false;
    isEditing = false;

    selectedFile: File | null = null;
    selectedFileName: string = '';
    imagePreview: string | null = null;
    categories: string[] = [];
    newCategory: string = '';
    settings = {
        maxPriceLimit: 1000000
    };

    // Form model for products
    currentProduct: Product = {
        id: 0,
        name: '',
        price: 0,
        description: '',
        image: '',
        category: 'autres'
    };

    // Form model for users
    newUser = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    };

    ngOnInit() {
        this.loadProducts();
        this.loadUsers();
        this.loadMessages();
        this.loadCategories();
        this.loadSettings();
    }

    loadMessages() {
        this.adminService.getMessages().subscribe(messages => {
            console.log('Messages chargés:', messages.length);
            this.messages = messages;
        });
    }

    deleteMessage(id: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
            this.adminService.deleteMessage(id).subscribe(() => {
                this.loadMessages();
            });
        }
    }

    switchTab(tab: 'products' | 'users' | 'messages' | 'settings') {
        this.activeTab = tab;
        // Toujours rafraîchir les données de l'onglet actif
        if (tab === 'messages') this.loadMessages();
        if (tab === 'users') this.loadUsers();
        if (tab === 'products') this.loadProducts();
        if (tab === 'settings') this.loadSettings();
    }



    openAddUserModal() {
        this.newUser = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };
        this.selectedFile = null;
        this.selectedFileName = '';
        this.imagePreview = null;
        this.showUserModal = true;
    }

    saveUser() {
        this.adminService.addUser(this.newUser, this.selectedFile || undefined).subscribe({
            next: () => {
                this.loadUsers();
                this.showUserModal = false;
            },
            error: (err) => {
                alert(err.error?.message || 'Erreur lors de la création de l\'utilisateur');
            }
        });
    }

    loadProducts() {
        this.productService.getProducts().subscribe(products => {
            this.products = products;
        });
    }

    loadCategories() {
        this.productService.getCategories().subscribe(categories => {
            this.categories = categories;
            if (!this.isEditing && this.categories.length > 0) {
                this.currentProduct.category = this.categories[0];
            }
        });
    }

    addNewCategory() {
        if (!this.newCategory.trim()) return;
        this.productService.addCategory(this.newCategory).subscribe({
            next: () => {
                this.loadCategories();
                this.newCategory = '';
                this.showCategoryModal = false;
            },
            error: (err) => alert(err.error?.message || 'Erreur lors de l\'ajout de la catégorie')
        });
    }

    deleteCategory(name: string) {
        if (confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ? Les produits associés seront déplacés vers "autres".`)) {
            this.productService.deleteCategory(name).subscribe({
                next: () => {
                    this.loadCategories();
                    this.loadProducts(); // Reload products as categories might have changed
                },
                error: (err) => alert(err.error?.message || 'Erreur lors de la suppression de la catégorie')
            });
        }
    }

    loadSettings() {
        this.productService.getSettings().subscribe(settings => {
            this.settings = settings;
        });
    }

    saveSettings() {
        this.productService.updateSettings(this.settings).subscribe({
            next: () => alert('Paramètres mis à jour avec succès'),
            error: (err) => alert('Erreur lors de la mise à jour des paramètres')
        });
    }

    loadUsers() {
        this.adminService.getUsers().subscribe(users => {
            this.users = users;
        });
    }

    toggleUserRole(user: any) {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (confirm(`Voulez-vous vraiment passer ${user.firstName} au rôle ${newRole} ?`)) {
            this.adminService.updateUserRole(user.id, newRole).subscribe(() => {
                this.loadUsers();
            });
        }
    }

    deleteUser(id: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            this.adminService.deleteUser(id).subscribe(() => {
                this.loadUsers();
            }, (error) => {
                alert(error.error?.message || 'Erreur lors de la suppression');
            });
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.selectedFileName = file.name;

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    openAddModal() {
        this.isEditing = false;
        this.selectedFile = null;
        this.selectedFileName = '';
        this.imagePreview = null;
        this.currentProduct = {
            id: 0,
            name: '',
            price: 0,
            description: '',
            image: '',
            category: this.categories.length > 0 ? this.categories[0] : 'autres'
        };
        this.showModal = true;
    }

    openEditModal(product: Product) {
        this.isEditing = true;
        this.selectedFile = null;
        this.selectedFileName = '';
        this.imagePreview = product.image;
        this.currentProduct = { ...product };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    saveProduct() {
        if (this.isEditing) {
            this.productService.updateProduct(this.currentProduct, this.selectedFile || undefined).subscribe(() => {
                this.loadProducts();
                this.closeModal();
            });
        } else {
            if (!this.selectedFile) {
                alert('Veuillez sélectionner une image');
                return;
            }
            this.productService.addProduct(this.currentProduct, this.selectedFile).subscribe(() => {
                this.loadProducts();
                this.closeModal();
            });
        }
    }

    deleteProduct(id: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            this.productService.deleteProduct(id).subscribe(() => {
                this.loadProducts();
            });
        }
    }
}
