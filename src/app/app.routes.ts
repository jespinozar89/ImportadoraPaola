import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductViewComponent } from './features/products/product-view/product-view.component';
import { ProductFavoriteComponent } from './features/products/product-favorite/product-favorite.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'producto/:id', component: ProductViewComponent },
   { path: 'wishlist', component: ProductFavoriteComponent },
  { path: '**', redirectTo: '' }
];
