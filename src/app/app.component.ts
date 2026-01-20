import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "@/shared/navbar/navbar.component";
import { SignInComponent } from "@/shared/components/sign-in/sign-in.component";
import { SignUpModalComponent } from "@/shared/components/sign-up/sign-up.component";
import { ForgotPasswordComponent } from "./shared/components/forgot-password/forgot-password.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SignInComponent, SignUpModalComponent, ForgotPasswordComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'paola-store';
}
