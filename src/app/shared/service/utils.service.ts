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
    // Usamos navigateByUrl para ir directamente a la ruta principal
    this.router.navigateByUrl(url);
  }
}
