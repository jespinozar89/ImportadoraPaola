import { Component, OnInit, DestroyRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { CartService } from '@/core/services/cart.service';
import { FavoriteService } from '@/core/services/favorite.service';
import { CarritoDetalladoDTO } from '@/shared/models/cart.interface';
import { RouterLink } from "@angular/router";
import { HotToastService } from '@ngxpert/hot-toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '@/core/services/order.service';
import { CrearPedido } from '@/shared/models/order.interface';
import { UtilsService } from '@/shared/service/utils.service';
import { environment } from '@/environments/environment';
import { BankInfo } from '@/shared/models/bank-info.interface';


declare var bootstrap: any;

@Component({
  selector: 'app-product-shopping-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-shopping-card.component.html',
  styleUrl: './product-shopping-card.component.scss'
})
export class ProductShoppingCardComponent implements OnInit, AfterViewInit {

  public cartItems: CarritoDetalladoDTO[] = [];
  public wishlistCount: number = 0;
  setupFee: number = 0;
  bankInfo!: BankInfo;
  processingOrder: boolean = false;
  fileName: string | null = null;
  fileBase64: string | null = null;

  constructor(
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private orderService: OrderService,
    private destroyRef: DestroyRef,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      this.bankInfo = environment.bankInfo;
      this.setupFee = Number(environment.orderSetupFee) || 0;
      this.cartItems = await lastValueFrom(this.cartService.getDetailedCart());

    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }

    this.favoriteService.favoritesCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => {
        this.wishlistCount = count;
      });
  }

  ngAfterViewInit() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el, { html: true }));
  }


  public isFavorite(idProduct: number): boolean {
    return this.favoriteService.isFavorite(idProduct);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.fileBase64 = reader.result as string;
      };

      reader.readAsDataURL(file);
    } else {
      this.fileName = null;
      this.fileBase64 = null;
    }
  }

  onOpenModal(){
    const modalElement = document.getElementById('compraExitosaModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }


  // ----------------------------------------------------------------------
  // CÁLCULOS SINCRONOS DEL RESUMEN DEL PEDIDO (Usan la propiedad cartItems)
  // ----------------------------------------------------------------------

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  get tax(): number {
    return this.setupFee;
  }

  get total(): number {
    return this.subtotal;
  }

  // ----------------------------------------------------------------------
  // ACCIONES (DELEGADAS A SERVICIOS)
  // ----------------------------------------------------------------------


  async processOrder(): Promise<void> {
    this.processingOrder = true;
    try {

      if (!this.fileBase64) {
        this.toast.warning('Por favor, adjunta un comprobante de pago');
        return;
      }

      let orderData: CrearPedido = {
        detalles: this.cartItems.map(item => ({
          producto_id: item.producto_id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        })),
        comprobante_pago: this.fileBase64 || null
      };

      const response = await this.orderService.create(orderData);

      if(response.pedido_id){
        this.clearCart();
        this.onOpenModal();
        this.toast.success('Pedido procesado con éxito');
      }

    } catch (error) {
      this.toast.error('Error al procesar el pedido');
    } finally {
      this.processingOrder = false;
    }
  }

  async addFavoritesToCart(): Promise<void> {
    const favoriteIds = await this.favoriteService.getCurrentFavoriteIds();

    if (favoriteIds.length === 0) {
      this.toast.warning('No hay productos favoritos para agregar al carrito');
      return;
    }

    const promises = favoriteIds
      .filter(id => !this.cartItems.find(item => item.producto_id === id))
      .map(id => this.cartService.addToCart(id));

    await Promise.all(promises);

    await this.refetchCartData();
    this.toast.success('Productos de favoritos agregados al carrito')
  }

  async decreaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 1) {
      await this.cartService.decreaseToCart(item.producto_id);
      await this.refetchCartData();
      this.toast.success('Producto restado al carrito')

    }
  }

  async increaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 0) {
      await this.cartService.addToCart(item.producto_id);
      await this.refetchCartData();
      this.toast.success('Producto sumado al carrito')
    }
  }

  async addToWishlist(item: CarritoDetalladoDTO): Promise<void> {
    await this.favoriteService.toggleFavorite(item.producto_id);

    if (this.isFavorite(item.producto_id)) {
      this.toast.success('Producto añadido a favoritos');
    } else {
      this.toast.success('Producto eliminado de favoritos');
    }
  }

  async removeItem(item: CarritoDetalladoDTO): Promise<void> {
    await this.cartService.removeFromCart(item.producto_id);
    await this.refetchCartData();
    this.toast.success('Producto eliminado del carrito')
  }

  async clearCart(): Promise<void> {
    await this.cartService.clearCart();
    await this.refetchCartData();
    this.fileName = null;
    this.fileBase64 = null;
  }

  private async refetchCartData(): Promise<void> {
    try {
      this.cartItems = await lastValueFrom(this.cartService.getDetailedCart());
    } catch (error) {
      console.error('Error al recargar el carrito:', error);
    }
  }
}
