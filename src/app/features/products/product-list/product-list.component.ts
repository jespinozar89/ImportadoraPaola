import { Component } from '@angular/core';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  products = [
    {
      id: 1,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    {
      id: 2,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    {
      id: 3,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    {
      id: 4,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    {
      id: 5,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    {
      id: 6,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    {
      id: 7,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    {
      id: 8,
      name: 'Auriculares inalámbricos con cancelación de ruido',
      description: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      price: 64990,
      availability: 'Disponible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80'
    },
    // otros productos...
  ];


}
