import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";

@Component({
  selector: 'app-product-favorite',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-favorite.component.html',
  styleUrl: './product-favorite.component.scss'
})
export class ProductFavoriteComponent implements OnInit {
  totalFavorites = 0;
  products = [
    {
      producto_id: 1,
      nombre: 'Auriculares inalámbricos con cancelación de ruido',
      descripcion: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      precio: 64990,
      stock: 0,
      imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80',
      categoria_id: 2
    },
    {
      producto_id: 1,
      nombre: 'Auriculares inalámbricos con cancelación de ruido',
      descripcion: 'Auriculares inalámbricos de primera calidad con cancelación activa de ruido y una batería de hasta 30 horas de duración.',
      precio: 64990,
      stock: 0,
      imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80',
      categoria_id: 2
    },
  ];

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.favoriteService.favoritesCount$.subscribe(count => {
      this.totalFavorites = count;
    });
  }
}
