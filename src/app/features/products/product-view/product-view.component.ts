import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-view',
  imports: [CommonModule],
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.scss'
})
export class ProductViewComponent {
  productId!: number;
  product: any;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    //private productService: ProductService
  ) { }

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    //this.product = this.productService.getProductById(this.productId);
    this.product =
    {
      id: this.productId,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    };
  }

increment() {
  this.quantity++;
}

decrement() {
  if (this.quantity > 1) {
    this.quantity--;
  }
}

}
