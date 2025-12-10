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
}
