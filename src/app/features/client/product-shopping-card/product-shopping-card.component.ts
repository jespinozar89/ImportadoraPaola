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
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LocationService } from '../../../core/services/location.service';
import { AddressService } from '../../../core/services/address.service';
import { ShippingService } from '@/core/services/shipping.service';
import { Region } from '@/shared/models/ubicacion.interface';
import { DireccionUsuario } from '@/shared/models/direccion.model';

declare var bootstrap: any;
const GUEST_DATA_KEY = 'guest_user_info';
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

@Component({
  selector: 'app-product-shopping-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, KlapModalComponent],
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

  public tipoEntrega: 'retiro' | 'despacho' = 'retiro';
  public costoEnvio: number = 0;
  public cargandoEnvio: boolean = false;
  public regions: Region[] = [];
  public communes: string[] = [];
  public isLoadingCommunes: boolean = false;

  public direccionesUsuario: DireccionUsuario[] = [];
  public direccionSeleccionada: DireccionUsuario | null = null;

  public addressForm!: FormGroup;
  public guestAddressForm!: FormGroup;

  public guestData: GuestUserData | null = null;
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
    private locationService: LocationService,
    private addressService: AddressService,
    private shippingService: ShippingService,
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit(): Promise<void> {
    this.initAddressForm();
    this.initGuestAddressForm();

    try {
      this.bankInfo = environment.bankInfo;
      this.setupFee = Number(environment.orderSetupFee) || 0;

      this.loadRegions();

      this.authService.isAuthenticated$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(async (isAuth) => {
          this.isAuthenticated = isAuth;

          if (isAuth) {
            this.clearGuestStorage();
            this.loadUserAddresses();
          } else {
            this.loadGuestDataFromStorage();
          }

          await this.refetchCartData();
        });

    } catch (error) {
      console.error('Error al cargar la información inicial:', error);
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

  private initAddressForm(): void {
    this.addressForm = this.fb.group({
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      departamento: [''],
      region: ['', Validators.required],
      comuna: [{ value: '', disabled: true }, Validators.required]
    });
  }

  private initGuestAddressForm(): void {
    this.guestAddressForm = this.fb.group({
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      departamento: [''],
      region: ['', Validators.required],
      comuna: [{ value: '', disabled: true }, Validators.required]
    });
  }

  onGuestRegionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const regionCode = selectElement.value;

    const communeControl = this.guestAddressForm.get('comuna');
    communeControl?.reset('');
    communeControl?.disable();
    this.communes = [];

    if (!regionCode) return;

    this.isLoadingCommunes = true;
    this.locationService.getCommunesByRegion(regionCode).subscribe({
      next: (data) => {
        this.communes = data;
        communeControl?.enable();
        this.isLoadingCommunes = false;
      },
      error: () => {
        this.toast.error('Error al cargar las comunas');
        this.isLoadingCommunes = false;
      }
    });
  }

  // ------------------------------------------
  // CARGA DE REGIONES Y COMUNAS
  // ------------------------------------------

  loadRegions(): void {
    this.locationService.getRegions().subscribe({
      next: (data) => (this.regions = data),
      error: () => this.toast.error('Error al cargar las regiones')
    });
  }

  onRegionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const regionCode = selectElement.value;

    const communeControl = this.addressForm.get('comuna');
    communeControl?.reset('');
    communeControl?.disable();
    this.communes = [];

    if (!regionCode) return;

    this.isLoadingCommunes = true;
    this.locationService.getCommunesByRegion(regionCode).subscribe({
      next: (data) => {
        this.communes = data;
        communeControl?.enable();
        this.isLoadingCommunes = false;
      },
      error: () => {
        this.toast.error('Error al cargar las comunas');
        this.isLoadingCommunes = false;
      }
    });
  }

  // ------------------------------------------
  // MANEJO DE DIRECCIONES (REGISTRADOS)
  // ------------------------------------------

  loadUserAddresses(): void {
    this.guestData = null;

    this.addressService.getMyAddresses().subscribe({
      next: (data) => {
        this.direccionesUsuario = data;
        const predeterminada = data.find(d => d.es_predeterminada);

        if (predeterminada) {
          this.seleccionarDireccion(predeterminada);
        } else if (data.length > 0) {
          this.seleccionarDireccion(data[0]);
        } else {
          this.direccionSeleccionada = null;
        }
      },
      error: () => this.toast.error('Error al cargar tus direcciones')
    });
  }

  seleccionarDireccion(dir: DireccionUsuario): void {
    this.direccionSeleccionada = dir;
    if (this.tipoEntrega === 'despacho') {
      this.cotizarEnvio(dir.comuna, dir.region);
    }
  }

  // ------------------------------------------
  // SELECCIÓN DE MÉTODO DE ENTREGA Y COTIZACIÓN
  // ------------------------------------------

  onCambioTipoEntrega(tipo: 'retiro' | 'despacho'): void {
    this.tipoEntrega = tipo;

    this.costoEnvio = 0;
    if (tipo === 'retiro') {
      //this.costoEnvio = 0;
      return;
    }

    if (this.isAuthenticated) {
      if (this.direccionSeleccionada) {
        this.cotizarEnvio(this.direccionSeleccionada.comuna, this.direccionSeleccionada.region);
      } else {
        this.openAddressModal();
      }
    } else {
      this.openGuestDataModal();
    }
  }

  cotizarEnvio(comuna: string, region: string): void {
    if (!comuna || !region) return;

    this.costoEnvio = 0;
    this.cargandoEnvio = false;

    // this.cargandoEnvio = true;
    // const payload = {
    //   comuna,
    //   region,
    //   subtotal: this.subtotal
    // };

    // this.shippingService.cotizarEnvio(payload).subscribe({
    //   next: (res: any) => {
    //     this.costoEnvio = res.costoEnvio || res.tarifa || 0;
    //     this.cargandoEnvio = false;
    //   },
    //   error: () => {
    //     this.toast.error('No se pudo calcular la tarifa de envío para la ubicación seleccionada.');
    //     this.costoEnvio = 0;
    //     this.cargandoEnvio = false;
    //   }
    // });
  }

  // ------------------------------------------
  // MODALES
  // ------------------------------------------

  openAddressModal(): void {
    if (!this.isAuthenticated && this.guestAddressForm.value) {
      const guestAddress = this.guestAddressForm.getRawValue();

      this.addressForm.patchValue({
        calle: guestAddress.calle || '',
        numero: guestAddress.numero || '',
        departamento: guestAddress.departamento || '',
        region: guestAddress.region || ''
      });

      if (guestAddress.region) {
        this.isLoadingCommunes = true;
        this.locationService.getCommunesByRegion(guestAddress.region).subscribe({
          next: (communes) => {
            this.communes = communes;
            const communeControl = this.addressForm.get('comuna');
            communeControl?.enable();
            communeControl?.setValue(guestAddress.comuna || '');
            this.isLoadingCommunes = false;
          },
          error: () => {
            this.toast.error('Error al cargar las comunas');
            this.isLoadingCommunes = false;
          }
        });
      }
    } else {
      this.addressForm.reset({
        calle: '',
        numero: '',
        departamento: '',
        region: '',
        comuna: ''
      });
      this.communes = [];
      this.addressForm.get('comuna')?.disable();
    }

    this.openModalById('addressModal');
  }

  saveAddressModal(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.toast.warning('Completa todos los campos requeridos de la dirección.');
      return;
    }

    this.isAuthenticated = this.authService.isAuthenticated();

    const formValues = this.addressForm.value;
    const selectedRegionObj = this.regions.find(r => r.codigo === formValues.region);
    const regionNombre = selectedRegionObj ? selectedRegionObj.region : formValues.region;

    if (this.isAuthenticated) {
      const nuevaDir = { ...formValues, region: regionNombre };
      this.addressService.createAddress(nuevaDir).subscribe({
        next: () => {
          this.toast.success('Dirección guardada');
          this.clearGuestStorage();
          this.loadUserAddresses();
          this.closeModalById('addressModal');
        },
        error: (err) => this.toast.error(err.message || 'Error al guardar la dirección')
      });
    } else {
      const calleCompleta = `${formValues.calle} #${formValues.numero} ${formValues.departamento ? 'Dpto: ' + formValues.departamento : ''}, ${formValues.comuna}, ${regionNombre}`;
      this.guestForm.direccion = calleCompleta;
      this.guestData = { ...this.guestForm };

      this.guestAddressForm.patchValue({
        calle: formValues.calle,
        numero: formValues.numero,
        departamento: formValues.departamento,
        region: formValues.region,
        comuna: formValues.comuna
      });

      this.cotizarEnvio(formValues.comuna, regionNombre);
      this.saveGuestDataToStorage();
      this.closeModalById('addressModal');
      this.toast.success('Dirección configurada correctamente');
    }
  }

  openGuestDataModal(): void {
    this.openModalById('guestDataModal');
  }

  confirmGuestData(): void {
    if (!this.guestForm.nombres || !this.guestForm.apellidos || !this.guestForm.email || !this.guestForm.telefono) {
      this.toast.warning('Por favor completa todos los campos de contacto.');
      return;
    }

    if (!EMAIL_REGEX.test(this.guestForm.email)) {
      this.toast.warning('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const phoneDigits = this.guestForm.telefono.replace(/\D/g, '');
    if (phoneDigits.length !== 9) {
      this.toast.warning('El número de teléfono debe tener exactamente 9 dígitos.');
      return;
    }

    if (this.tipoEntrega === 'despacho') {
      if (this.guestAddressForm.invalid) {
        this.guestAddressForm.markAllAsTouched();
        this.toast.warning('Por favor completa la dirección de entrega.');
        return;
      }

      const formValues = this.guestAddressForm.value;
      const selectedRegionObj = this.regions.find(r => r.codigo === formValues.region);
      const regionNombre = selectedRegionObj ? selectedRegionObj.region : formValues.region;

      const calleCompleta = `${formValues.calle} #${formValues.numero} ${formValues.departamento ? 'Dpto: ' + formValues.departamento : ''}, ${formValues.comuna}, ${regionNombre}`;

      this.guestForm.direccion = calleCompleta;
      this.guestData = { ...this.guestForm };

      this.addressForm.patchValue({
        calle: formValues.calle,
        numero: formValues.numero,
        departamento: formValues.departamento,
        region: formValues.region,
        comuna: formValues.comuna
      });

      this.cotizarEnvio(formValues.comuna, regionNombre);
    } else {
      this.guestForm.direccion = 'Retiro en tienda';
      this.guestData = { ...this.guestForm };
      this.costoEnvio = 0;
    }

    this.saveGuestDataToStorage();

    this.closeModalById('guestDataModal');
    this.toast.success('Datos guardados correctamente.');
  }

  openGuestModalByDeliveryType(): void {
    if (this.isAuthenticated) {
      if (this.tipoEntrega === 'despacho') {
        this.openAddressModal();
      }
      return;
    }

    if (this.tipoEntrega === 'despacho') {
      this.openGuestDataModal();
    } else {
      this.openGuestDataModal();
    }
  }

  private openModalById(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  private closeModalById(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.hide();
    }

    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());

      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }, 300);
  }

  // ------------------------------------------
  // CÁLCULOS DEL TOTAL
  // ------------------------------------------

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + this.utilsService.getEffectivePrice(item) * item.cantidad, 0);
  }

  get total(): number {
    return this.subtotal + (this.tipoEntrega === 'despacho' ? this.costoEnvio : 0);
  }

  // ------------------------------------------
  // PROCESAMIENTO DEL PEDIDO
  // ------------------------------------------

  async processOrder(): Promise<void> {
    this.processingOrder = true;
    this.orderHandled = false;

    try {

      const currentRole = this.authService.getRolAuthToken();
      if (currentRole?.toLocaleLowerCase().includes("admin")) {
        this.processingOrder = false;
        this.toast.error('Los administradores no pueden realizar compras.');
        return;
      }

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

      let direccionTexto = 'Retiro en tienda.';
      let comunaFinal = 'Valparaíso';
      let regionFinal = 'Valparaíso';



      if (this.tipoEntrega === 'despacho') {
        if (this.isAuthenticated) {
          if (this.direccionSeleccionada) {
            direccionTexto = [
              this.direccionSeleccionada.calle,
              `#${this.direccionSeleccionada.numero}`,
              this.direccionSeleccionada.departamento ? `Dpto: ${this.direccionSeleccionada.departamento},` : ',',
              `${this.direccionSeleccionada.comuna},`,
              this.direccionSeleccionada.region
            ].filter(Boolean).join(' ');
            comunaFinal = this.direccionSeleccionada.comuna || comunaFinal;
            regionFinal = this.direccionSeleccionada.region || regionFinal;
          } else {
            this.processingOrder = false;
            this.openAddressModal();
            return;
          }
        } else if (this.guestData) {
          direccionTexto = this.guestData.direccion || direccionTexto;
          comunaFinal = this.guestAddressForm.get('comuna')?.value || comunaFinal;

          const codigoRegion = this.guestAddressForm.get('region')?.value;
          if (codigoRegion) {
            const regionEncontrada = this.regions.find(r => r.codigo === codigoRegion);
            regionFinal = regionEncontrada ? regionEncontrada.region : regionFinal;
          }
        } else {
          this.processingOrder = false;
          this.openGuestDataModal();
          return;
        }
      }

      const addressLineTruncated = direccionTexto.trim();
      const addressStateTrucanted = regionFinal.trim();

      if (currentUser && currentUser.email) {
        userPayload = {
          email: currentUser.email,
          rut: null,
          first_name: currentUser.nombres?.trim() || 'Cliente',
          last_name: currentUser.apellidos?.trim() || 'Registrado',
          phone: currentUser.telefono?.replace(/\s+/g, '') || '',
          address_line: addressLineTruncated,
          address_city: comunaFinal,
          address_state: addressStateTrucanted,
          country: 'CL',
          postal_code: null
        };
      } else if (this.guestData) {
        userPayload = {
          email: this.guestData.email,
          rut: null,
          first_name: this.guestData.nombres?.trim() || 'Cliente',
          last_name: this.guestData.apellidos?.trim() || 'Invitado',
          phone: this.guestData.telefono?.replace(/\s+/g, '') || '',
          address_line: addressLineTruncated,
          address_city: comunaFinal,
          address_state: addressStateTrucanted,
          country: 'CL',
          postal_code: null
        };
      } else {
        this.processingOrder = false;
        this.openGuestDataModal();
        return;
      }

      const items = this.cartItems.map(item => {
        const effectivePrice = Math.round(this.utilsService.getEffectivePrice(item));
        return {
          name: item.nombre,
          code: item.producto_id.toString(),
          price: effectivePrice * item.cantidad,
          unit_price: effectivePrice,
          quantity: item.cantidad
        };
      });

      // if (this.tipoEntrega === 'despacho' && this.costoEnvio > 0) {
      //   const costoEnvioEntero = Math.round(this.costoEnvio);
      //   items.push({
      //     name: 'Despacho a domicilio',
      //     code: 'SHIPPING',
      //     price: costoEnvioEntero,
      //     unit_price: costoEnvioEntero,
      //     quantity: 1
      //   });
      // }

      const totalCalculado = items.reduce((sum, item) => sum + item.price, 0);

      this.orderData = {
        referenceId: 'REF-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        user: userPayload,
        items,
        total: totalCalculado
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
        direccion_envio: userPayload.address_line,
        tipo_entrega: this.tipoEntrega,
        subtotal: this.subtotal,
        costo_envio: this.tipoEntrega === 'despacho' ? this.costoEnvio : 0,
        total: this.total,
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
      return response.pedido_id || 0;
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      return 0;
    }
  }

  // --- MÉTODOS AUXILIARES Y CARRITO ---

  public isFavorite(idProduct: number): boolean {
    return this.favoriteService.isFavorite(idProduct);
  }

  onOpenModal() {
    this.openModalById('compraExitosaModal');
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

      if (!this.isAuthenticated) {
        this.clearGuestStorage();
      }

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

  // ------------------------------------------
  // MÉTODOS LOCAL STORAGE PARA INVITADO
  // ------------------------------------------

  private saveGuestDataToStorage(): void {
    if (this.isAuthenticated) return;

    const dataToSave = {
      guestForm: this.guestForm,
      guestData: this.guestData,
      guestAddressFormValue: this.guestAddressForm.getRawValue(),
      savedAt: Date.now()
    };

    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(dataToSave));
  }

  private loadGuestDataFromStorage(): void {
    const saved = localStorage.getItem(GUEST_DATA_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      const THIRTY_MINUTES_MS = 45 * 60 * 1000;
      const now = Date.now();

      if (parsed.savedAt && (now - parsed.savedAt > THIRTY_MINUTES_MS)) {
        this.clearGuestStorage();
        return;
      }

      if (parsed.guestForm) {
        this.guestForm = { ...parsed.guestForm };
      }
      if (parsed.guestData) {
        this.guestData = { ...parsed.guestData };
      }

      if (parsed.guestAddressFormValue) {
        const addr = parsed.guestAddressFormValue;
        this.guestAddressForm.patchValue({
          calle: addr.calle || '',
          numero: addr.numero || '',
          departamento: addr.departamento || '',
          region: addr.region || '',
        });

        if (addr.region) {
          this.locationService.getCommunesByRegion(addr.region).subscribe({
            next: (communes) => {
              this.communes = communes;
              const communeControl = this.guestAddressForm.get('comuna');
              communeControl?.enable();
              communeControl?.setValue(addr.comuna || '');

              if (addr.comuna && this.tipoEntrega === 'despacho') {
                const selectedRegionObj = this.regions.find(r => r.codigo === addr.region);
                const regionNombre = selectedRegionObj ? selectedRegionObj.region : addr.region;
                this.cotizarEnvio(addr.comuna, regionNombre);
              }
            }
          });
        }
      }
    } catch (e) {
      console.error('Error al parsear datos de invitado desde LocalStorage', e);
    }
  }

  private clearGuestStorage(): void {
    localStorage.removeItem(GUEST_DATA_KEY);
    this.guestData = null;

    this.guestForm = {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion: ''
    };

    this.guestAddressForm.reset({
      calle: '',
      numero: '',
      departamento: '',
      region: '',
      comuna: ''
    });

    this.communes = [];
    this.guestAddressForm.get('comuna')?.disable();
  }
}
