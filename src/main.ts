import { bootstrapApplication } from '@angular/platform-browser';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { registerLocaleData } from '@angular/common';
import localeEsCL from '@angular/common/locales/es-CL';

registerLocaleData(localeEsCL);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideRouter(routes),
    provideHotToastConfig({
      position: 'top-center',
      dismissible: true,
      duration: 4000,
      style: {
        marginTop: '80px'
      }
    }),
  ]
}).catch(err => console.error(err));
