import { Routes } from '@angular/router';
import { roleGuard } from '@/core/guard/role.guard';

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
    path: 'perfilFrom',
    loadComponent: () =>
      import('@/features/client/perfil-form/perfil-form.component')
        .then(m => m.PerfilFormComponent)
  },
  {
    path: 'resetPassword',
    loadComponent: () =>
      import('@/shared/components/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('@/features/client/product-favorite/product-favorite.component')
        .then(m => m.ProductFavoriteComponent)
  },
  {
    path: 'orderList',
    canActivate: [roleGuard],
    data: { roles: ['cliente'] },
    loadComponent: () =>
      import('@/features/client/order-list/order-list.component')
        .then(m => m.OrderListComponent)
  },
  {
    path: 'orderDetailUser/:id',
    canActivate: [roleGuard],
    data: { roles: ['cliente'] },
    loadComponent: () =>
      import('@/features/client/order-detail-user/order-detail-user.component')
        .then(m => m.OrderDetailUserComponent)
  },
  {
    path: 'shop',
    canActivate: [roleGuard],
    data: { roles: ['administrador', 'cliente'] },
    loadComponent: () =>
      import('@/features/client/product-shopping-card/product-shopping-card.component')
        .then(m => m.ProductShoppingCardComponent)
  },
  // admin
  {
    path: 'form',
    canActivate: [roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('@/features/admin/product-form/product-form.component')
        .then(m => m.ProductFormComponent)
  },
  {
    path: 'inventory',
    canActivate: [roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('@/features/admin/product-inventory/product-inventory.component')
        .then(m => m.ProductInventoryComponent)
  },
  {
    path: 'orders',
    canActivate: [roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('@/features/admin/order-management/order-management.component')
        .then(m => m.OrderManagementComponent)
  },
  {
    path: 'orderDetail/:id',
    canActivate: [roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('@/features/admin/order-detail/order-detail.component')
        .then(m => m.OrderDetailComponent)
  },
  {
    path: 'categories',
    canActivate: [roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('@/features/admin/categories/categories.component')
        .then(m => m.CategoriesComponent)
  },
  {
    path: 'bulkUpload',
    canActivate: [roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('@/features/admin/bulk-upload/bulk-upload.component')
        .then(m => m.BulkUploadComponent)
  },
  // ruta por defecto
  { path: '**', redirectTo: '' }
];
