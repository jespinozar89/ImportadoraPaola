import { Component, OnInit, DestroyRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, lastValueFrom, timer } from 'rxjs';
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
import { KlapModalComponent } from "@/shared/components/klap-modal/klap-modal.component";
import { Order, OrderResponse } from '@/shared/models/klap.interface';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '@/core/services/product.service';
import { GuestUserData } from '@/shared/models/auth.interface';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-product-shopping-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, KlapModalComponent],
  templateUrl: './product-shopping-card.component.html',
  styleUrl: './product-shopping-card.component.scss'
})
export class ProductShoppingCardComponent implements OnInit, AfterViewInit {

  @ViewChild('klapModal') klapModal!: KlapModalComponent;

  public cartItems: CarritoDetalladoDTO[] = [];
  public wishlistCount: number = 0;
  private orderHandled = false;
  public availableProductIds: Set<number> = new Set<number>();


  orderData: Order = {} as Order;
  setupFee: number = 0;
  bankInfo!: BankInfo;
  processingOrder: boolean = false;
  isAuthenticated: boolean = false;
  fileName: string | null = null;
  fileBase64: string | null = null;


  public guestData: GuestUserData | null = null;
  public isGuestModalOpen: boolean = false;

  public guestForm = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: ''
  };

  constructor(
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      this.bankInfo = environment.bankInfo;
      this.setupFee = Number(environment.orderSetupFee) || 0;
      this.isAuthenticated = this.authService.isAuthenticated();

      await this.refetchCartData();

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

  onOpenModal() {
    const modalElement = document.getElementById('compraExitosaModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }


  // ------------------------------------------
  // CÁLCULOS SINCRONOS DEL RESUMEN DEL PEDIDO
  // ------------------------------------------

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + this.utilsService.getEffectivePrice(item) * item.cantidad, 0);
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
    this.orderHandled = false;

    try {
      await this.validateStockInCart();
      const itemsConStock = this.cartItems.filter(item => this.hasStock(item.producto_id));

      if (itemsConStock.length < this.cartItems.length) {
        this.processingOrder = false;
        await this.refetchCartData();
        this.toast.error('Hay productos agotados en tu carrito. Por favor elimínalos o ajústalos para continuar.');
        return;
      }

      if (itemsConStock.length === 0) {
        this.processingOrder = false;
        this.toast.error('No tienes productos con stock disponible para comprar.');
        return;
      }

      const currentUser = this.authService.getCurrentUserProfile();
      let userPayload: any;

      if (currentUser && currentUser.email) {
        userPayload = {
          email: currentUser.email,
          rut: null,
          first_name: currentUser.nombres || '',
          last_name: currentUser.apellidos || '',
          phone: currentUser.telefono || '',
          address_line: null,
          address_city: null,
          address_state: null,
          country: 'CL',
          postal_code: null
        };
      } else if (this.guestData) {
        userPayload = {
          email: this.guestData.email,
          rut: null,
          first_name: this.guestData.nombres || '',
          last_name: this.guestData.apellidos || '',
          phone: this.guestData.telefono || '',
          address_line: null,
          address_city: null,
          address_state: null,
          country: 'CL',
          postal_code: null
        };
      } else {
        this.processingOrder = false;
        this.openGuestDataModal();
        return;
      }

      const items = this.cartItems.map(item => {
        const effectivePrice = this.utilsService.getEffectivePrice(item);
        return {
          name: item.nombre,
          code: item.producto_id.toString(),
          price: effectivePrice * item.cantidad,
          unit_price: effectivePrice,
          quantity: item.cantidad
        };
      });

      const total = items.reduce((acc, item) => acc + item.price, 0);

      this.orderData = {
        referenceId: 'REF-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        user: userPayload,
        items,
        total
      };

      await this.createOrder(this.orderData.referenceId, userPayload);
      await this.openKlapModal();

    } catch (error) {
      this.toast.error('Error al procesar el pedido');
      this.processingOrder = false;
      this.closeKlapModal();
    }
  }

  async createOrder(klapOrderId: string, userPayload: any): Promise<number> {
    try {
      let orderData: CrearPedido = {
        nombre_contacto: `${userPayload.first_name} ${userPayload.last_name}`.trim(),
        email_contacto: userPayload.email,
        telefono_contacto: userPayload.phone,
        direccion_envio: userPayload.address_line || 'Retiro en tienda.',
        detalles: this.cartItems.map(item => ({
          producto_id: item.producto_id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          precio_unitario_oferta: item.precio_oferta ? item.precio_oferta : null
        })),
        klap_order_id: klapOrderId || null
      };

      const response = await this.orderService.create(orderData);

      if (response.pedido_id) {
        return response.pedido_id;
      }

      return 0;
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      return 0;
    }
  }

  async addFavoritesToCart(): Promise<void> {
    const favoriteIds = this.favoriteService.getCurrentFavoriteIds();

    if (favoriteIds.length === 0) {
      this.toast.warning('No hay productos favoritos para agregar al carrito');
      return;
    }

    const idsNotInCart = favoriteIds
      .filter(id => !this.cartItems.some(item => item.producto_id === id))
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0);

    if (idsNotInCart.length === 0) {
      this.toast.info('Todos tus productos favoritos ya están en el carrito');
      return;
    }

    const availableIds = await this.productService.filterWithStock(idsNotInCart);

    if (availableIds.length === 0) {
      this.toast.error('Ninguno de los productos favoritos seleccionados tiene stock disponible');
      return;
    }

    const outOfStockCount = idsNotInCart.length - availableIds.length;
    if (outOfStockCount > 0) {
      this.toast.warning(`${outOfStockCount} producto(s) no se agregaron por falta de stock`);
    }

    const promises = availableIds.map(id => this.cartService.addToCart(id));
    await Promise.all(promises);

    await this.refetchCartData();
    this.toast.success('Productos de favoritos agregados al carrito');
  }

  async increaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 0) {
      await this.cartService.addToCart(item.producto_id);
      await this.refetchCartData();
      this.toast.success('Producto sumado al carrito');
    }
  }

  async decreaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 1) {
      await this.cartService.decreaseToCart(item.producto_id);
      await this.refetchCartData();
      this.toast.success('Producto restado al carrito');
    }
  }

  async removeItem(item: CarritoDetalladoDTO): Promise<void> {
    await this.cartService.removeFromCart(item.producto_id);
    await this.refetchCartData();
    this.toast.success('Producto eliminado del carrito');
  }

  async addToWishlist(item: CarritoDetalladoDTO): Promise<void> {
    await this.favoriteService.toggleFavorite(item.producto_id);

    if (this.isFavorite(item.producto_id)) {
      this.toast.success('Producto añadido a favoritos');
    } else {
      this.toast.success('Producto eliminado de favoritos');
    }
  }

  async clearCart(): Promise<void> {
    await this.cartService.clearCart();
    await this.refetchCartData();
    this.fileName = null;
    this.fileBase64 = null;
  }

  private async refetchCartData(): Promise<void> {
    try {
      this.isAuthenticated = this.authService.isAuthenticated();

      if (this.isAuthenticated) {
        this.cartItems = await lastValueFrom(this.cartService.getDetailedCart());
      } else {
        const itemsMap = this.cartService.getCartItems();
        const localItems: CarritoDetalladoDTO[] = [];

        for (const [productId, item] of itemsMap.entries()) {
          const prod = await this.productService.findById(productId);
          if (prod) {
            localItems.push({
              carrito_id: 0,
              producto_id: prod.producto_id!,
              nombre: prod.nombre,
              precio: prod.precio,
              precio_oferta: prod.precio_oferta,
              cantidad: item.cantidad,
              imagen: prod.imagenes?.[0]?.url || 'null.png',
              stock: prod.stock
            } as CarritoDetalladoDTO);
          }
        }
        this.cartItems = localItems;
      }

      await this.validateStockInCart();
    } catch (error) {
      console.error('Error al recargar el carrito:', error);
    }
  }

  async validateStockInCart(): Promise<void> {
    if (this.cartItems.length === 0) {
      this.availableProductIds.clear();
      return;
    }

    const allIds = this.cartItems.map(item => item.producto_id);
    const availableIdsArray = await this.productService.filterWithStock(allIds);

    this.availableProductIds = new Set(availableIdsArray);
  }

  hasStock(productoId: number): boolean {
    return this.availableProductIds.has(productoId);
  }

  async openKlapModal() {
    await this.klapModal.openModal(this.orderData);
  }

  closeKlapModal() {
    this.klapModal.closeModal();
  }

  async handleOrderResult(res: OrderResponse) {
    if (this.orderHandled) return;

    if (res.status === 'completed') {
      this.orderHandled = true;

      this.toast.success('Procesando tu pedido... Por favor, espera unos segundos.');
      await firstValueFrom(timer(3000));

      this.processingOrder = false;
      this.closeKlapModal();
      await this.clearCart();
      this.onOpenModal();
      this.toast.success('Pedido procesado con éxito');
    }
    else if (res.status === 'rejected') {
      this.orderHandled = true;
      setTimeout(() => {
        this.processingOrder = false;
        this.closeKlapModal();
        this.toast.warning('No pudimos procesar tu pedido. Por favor, inténtalo de nuevo.');
      }, 2000);
    }
    else if (res.status.includes('forcedClose') || res.status === 'refund') {
      this.orderHandled = true;
      this.processingOrder = false;
      this.toast.warning('Tu solicitud ha sido cancelada.');
      this.closeKlapModal();
    }
  }

  getItemTotal(item: any): number {
    if (!item) return 0;

    const tieneOferta = this.utilsService.getDiscountPercentage(item.precio, item.precio_oferta) > 0;
    const precioUnitario = tieneOferta
      ? this.utilsService.parsePrice(item.precio_oferta)
      : this.utilsService.parsePrice(item.precio);

    return item.cantidad * precioUnitario;
  }

  openGuestDataModal(): void {
    const modalElement = document.getElementById('guestDataModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmGuestData(): void {
    if (!this.guestForm.nombres || !this.guestForm.email || !this.guestForm.telefono) {
      this.toast.warning('Por favor completa todos los campos requeridos.');
      return;
    }

    this.guestData = {
      nombres: this.guestForm.nombres,
      apellidos: this.guestForm.apellidos,
      email: this.guestForm.email,
      telefono: this.guestForm.telefono,
      direccion: this.guestForm.direccion
    };

    const modalElement = document.getElementById('guestDataModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }

    this.processOrder();
  }

}
