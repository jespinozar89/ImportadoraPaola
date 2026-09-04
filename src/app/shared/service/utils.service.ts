import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoDetalladoDTO } from '../models/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private location: Location,
    private router: Router
  ) { }

  public goBack(): void {
    this.location.back();
  }

  public goToUrl(url: string = '/'): void {
    this.router.navigateByUrl(url);
  }

  getCategoriaNombre(nombre: string): string {
    return nombre.replace(/_/g, ' ');
  }

  parsePrice(val: string | number | null | undefined): number {
    if (val === null || val === undefined || val === '') return 0;
    const num = typeof val === 'number' ? val : Number(val);
    return isNaN(num) ? 0 : num;
  }

  hasValidOffer(product: any): boolean {
    if (!product) return false;

    const precio = this.parsePrice(product.precio);
    const precioOferta = this.parsePrice(product.precio_oferta);

    return precioOferta > 0 && precioOferta < precio;
  }

  public getEffectivePrice(item: CarritoDetalladoDTO): number {
    return (item.precio_oferta && item.precio_oferta > 0) ? item.precio_oferta : item.precio;
  }

  public getDiscountPercentage(
    precio: string | number | null | undefined,
    precioOferta: string | number | null | undefined
  ): number {
    const pVal = this.parsePrice(precio);
    const pOfertaVal = this.parsePrice(precioOferta);

    if (pVal <= 0 || pOfertaVal <= 0 || pOfertaVal >= pVal) {
      return 0;
    }

    const discount = ((pVal - pOfertaVal) / pVal) * 100;
    return Math.round(discount);
  }

  getItemSubtotal(item: any): number {
    if (!item?.producto) return 0;

    const tieneOferta = this.hasValidOffer(item.producto);
    const precioAplicado = tieneOferta
      ? this.parsePrice(item.producto.precio_oferta)
      : this.parsePrice(item.producto.precio);

    const cantidad = Number(item.cantidad || 0);
    return precioAplicado * cantidad;
  }

}
