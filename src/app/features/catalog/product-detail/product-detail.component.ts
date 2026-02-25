import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

import { Product } from '../../../core/models/product.model';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);


    product: Product | undefined;

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.productService.getProductById(id).subscribe(product => {
            this.product = product;
        });
    }

    orderOnWhatsApp() {
        if (this.product) {
            const phoneNumber = '690363577';
            const message = `Bonjour, je viens de votre site pour ce produit : ${this.product.name}.
Caractéristiques : ${this.product.description || 'N/A'}.
Prix : ${this.product.price} FCFA`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/237${phoneNumber}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        }
    }
}
