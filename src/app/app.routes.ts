import { Routes } from '@angular/router';
import { ProductListComponent } from './features/client/product-list/product-list.component';
import { ProductViewComponent } from './features/client/product-view/product-view.component';
import { ProductFavoriteComponent } from './features/client/product-favorite/product-favorite.component';
import { ProductShoppingCardComponent } from './features/client/product-shopping-card/product-shopping-card.component';
import { ProductFormComponent } from './features/admin/product-form/product-form.component';
import { ProductInventoryComponent } from './features/admin/product-inventory/product-inventory.component';
import { OrderManagementComponent } from './features/admin/order-management/order-management.component';
import { OrderDetailComponent } from './features/admin/order-detail/order-detail.component';
import { CategoriesComponent } from './features/admin/categories/categories.component';

//debo aplicar Lazy Loading en el futuro
export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'categorias/:nombre/:id', component: ProductListComponent },
  { path: 'producto/:id', component: ProductViewComponent },
  { path: 'wishlist', component: ProductFavoriteComponent },
  { path: 'shop', component: ProductShoppingCardComponent },
  { path: 'form', component: ProductFormComponent },
  { path: 'inventory', component: ProductInventoryComponent },
  { path: 'orders', component: OrderManagementComponent },
  { path: 'orderDetail', component: OrderDetailComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: '**', redirectTo: '' }
];
