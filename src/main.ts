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
      style: {
        marginTop: '70px'
      }
    })
  ]
}).catch(err => console.error(err));
