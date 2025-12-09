import { Routes } from '@angular/router';

export const routes: Routes = [
  //cliente
  {
    path: '',
    loadComponent: () =>
      import('@/features/client/product-list/product-list.component')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'categorias/:nombre/:id',
    loadComponent: () =>
      import('@/features/client/product-list/product-list.component')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('@/features/client/product-view/product-view.component')
        .then(m => m.ProductViewComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('@/features/client/product-favorite/product-favorite.component')
        .then(m => m.ProductFavoriteComponent)
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('@/features/client/product-shopping-card/product-shopping-card.component')
        .then(m => m.ProductShoppingCardComponent)
  },
  // admin
  {
    path: 'form',
    loadComponent: () =>
      import('@/features/admin/product-form/product-form.component')
        .then(m => m.ProductFormComponent)
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('@/features/admin/product-inventory/product-inventory.component')
        .then(m => m.ProductInventoryComponent)
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('@/features/admin/order-management/order-management.component')
        .then(m => m.OrderManagementComponent)
  },
  {
    path: 'orderDetail',
    loadComponent: () =>
      import('@/features/admin/order-detail/order-detail.component')
        .then(m => m.OrderDetailComponent)
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('@/features/admin/categories/categories.component')
        .then(m => m.CategoriesComponent)
  },
  // ruta por defecto
  { path: '**', redirectTo: '' }
];
