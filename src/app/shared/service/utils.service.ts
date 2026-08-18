import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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

}
