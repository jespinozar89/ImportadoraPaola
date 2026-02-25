import { Pedido } from '@/shared/models/order.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  downloadCsvClientList(orders: Pedido): void {
    const csvData = this.csvClientList(orders);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const clientFullName = `${orders.usuario?.nombres}_${orders.usuario?.apellidos}`.replace(/\s+/g, '_');
    const orderIdFormatted = orders.pedido_id.toString().padStart(4, '0');
    const fileName = `${clientFullName}_${orderIdFormatted}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private csvClientList(orders: Pedido): string {
    let csvContent = '';

    // --- Table 1: Order Info ---
    csvContent += 'Informacion Pedido\n';
    csvContent += 'Numero_pedido,Fecha_pedido,Estado,Total\n';
    csvContent += `${orders.pedido_id},${orders.fecha_pedido},${orders.estado},${orders.total}\n\n`;

    // --- Table 2: User Info ---
    csvContent += 'Informacion Usuario\n';
    csvContent += 'Nombres,Apellidos,Email,Telefono\n';
    csvContent += `${orders.usuario?.nombres},${orders.usuario?.apellidos},${orders.usuario?.email},${orders.usuario?.telefono}\n\n`;

    // --- Table 3: Order Details ---
    csvContent += 'Detalle Pedido\n';
    csvContent += 'Producto_codigo,Nombre,Cantidad,Precio_unitario,Total\n';

    orders.detalles?.forEach((d: any) => {
      const total = Number(d.precio_unitario) * Number(d.cantidad);
      csvContent += `${d.producto.producto_codigo},${d.producto.nombre},${d.cantidad},${d.precio_unitario},${total}\n`;
    });

    csvContent += '\n\n';


    return csvContent;
  }

}
