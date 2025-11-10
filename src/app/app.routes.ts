import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductViewComponent } from './features/products/product-view/product-view.component';
import { ProductFavoriteComponent } from './features/products/product-favorite/product-favorite.component';
import { ProductShoppingCardComponent } from './features/products/product-shopping-card/product-shopping-card.component';
import { ProductFormComponent } from './features/admin/product-form/product-form.component';
import { ProductInventoryComponent } from './features/admin/product-inventory/product-inventory.component';
import { OrderManagementComponent } from './features/admin/order-management/order-management.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'producto/:id', component: ProductViewComponent },
  { path: 'wishlist', component: ProductFavoriteComponent },
  { path: 'shop', component: ProductShoppingCardComponent },
  { path: 'form', component: ProductFormComponent },
  { path: 'inventory', component: ProductInventoryComponent },
  { path: 'orders', component: OrderManagementComponent },
  { path: '**', redirectTo: '' }
];
