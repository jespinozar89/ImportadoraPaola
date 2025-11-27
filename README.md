# PaolaStore

Este proyecto fue generado usando [Angular CLI](https://github.com/angular/angular-cli) versión 19.2.19.

## Servidor de Desarrollo

Para iniciar un servidor de desarrollo local, ejecuta:

```bash
ng serve
```

Una vez que el servidor esté en funcionamiento, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques cualquier archivo fuente.

## Scaffolding de Codigo

Angular CLI incluye potentes herramientas de scaffolding de código. Para generar un nuevo componente, ejecuta:

```bash
ng generate component nombre-del-componente
```

Para obtener una lista completa de las plantillas disponibles (como components, directives o pipes), ejecuta:

```bash
ng generate --help
```

## Compilacion (Building) 

Para compilar el proyecto, ejecuta:

```bash
ng build
```

Esto compilará tu proyecto y almacenará los artefactos de compilación en el directorio `dist/`. Por defecto, la compilación de producción optimiza tu aplicación para el rendimiento y la velocidad.

## Ejecución de Pruebas Unitarias

Para ejecutar las pruebas unitarias con el ejecutor de pruebas [Karma](https://karma-runner.github.io) , usa el siguiente comando:

```bash
ng test
```

## Ejecución de Pruebas End-to-End

Para realizar pruebas de extremo a extremo (e2e), ejecuta:

```bash
ng e2e
```

Angular CLI no incluye un framework de pruebas end-to-end por defecto. Puedes elegir uno que se adapte a tus necesidades.

## Recursos Adicionales

Para más información sobre el uso de [Angular CLI, incluyendo referencias detalladas de comandos](https://angular.dev/tools/cli), visita la página Angular CLI Overview and Command Reference.

# Documentacion

## Estructura del Proyecto

La organización de los directorios y archivos sigue un patrón modular, facilitando la escalabilidad y el mantenimiento:

```bash

src/
├── app/
│   ├── core/
│   │   └── services/          # Servicios fundamentales que se usan globalmente (ej. carrito, favoritos).
│   ├── features/              # Contiene la lógica y la UI de las funcionalidades principales.
│   │   └── admin/             # Funcionalidades específicas del panel administrativo.
│   │   └── cliente/             # Funcionalidades ecliente.
│   ├── shared/
│   │   └── components/        # Componentes UI reutilizables (ej. tarjetas de producto, formularios de acceso).
│   ├── navbar/                # Módulo o componente de navegación principal.

```

