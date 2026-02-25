import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBase}/api/products`;
    private baseUrl = environment.baseUrl;

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            map(products => products.map(p => this.formatProductImage(p)))
        );
    }

    getProductById(id: number): Observable<Product | undefined> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
            map(product => product ? this.formatProductImage(product) : undefined)
        );
    }

    private formatProductImage(product: Product): Product {
        if (product.image && product.image.startsWith('assets/')) {
            return { ...product, image: this.baseUrl + product.image };
        }
        return product;
    }

    addProduct(product: Product, imageFile: File): Observable<Product> {
        const formData = new FormData();
        formData.append('product', JSON.stringify(product));
        formData.append('image', imageFile);
        const token = localStorage.getItem('token');
        return this.http.post<Product>(this.apiUrl, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    updateProduct(product: Product, imageFile?: File): Observable<Product> {
        const formData = new FormData();
        formData.append('product', JSON.stringify(product));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const token = localStorage.getItem('token');
        return this.http.put<Product>(`${this.apiUrl}/${product.id}`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    deleteProduct(id: number): Observable<void> {
        const token = localStorage.getItem('token');
        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${environment.apiBase}/api/categories`);
    }

    addCategory(name: string): Observable<any> {
        const token = localStorage.getItem('token');
        return this.http.post(`${environment.apiBase}/api/categories`, { name }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    deleteCategory(name: string): Observable<void> {
        const token = localStorage.getItem('token');
        return this.http.delete<void>(`${environment.apiBase}/api/categories/${name}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    getSettings(): Observable<any> {
        return this.http.get(`${environment.apiBase}/api/settings`);
    }

    updateSettings(settings: any): Observable<any> {
        const token = localStorage.getItem('token');
        return this.http.put(`${environment.apiBase}/api/settings`, settings, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
}
