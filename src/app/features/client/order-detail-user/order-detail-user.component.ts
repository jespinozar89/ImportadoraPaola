import { OrderService } from '@/core/services/order.service';
import { Pedido } from '@/shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UtilsService } from '@/shared/service/utils.service';

@Component({
  selector: 'app-order-detail-user',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail-user.component.html',
  styleUrl: './order-detail-user.component.scss'
})
export class OrderDetailUserComponent implements OnInit {

  order!: Pedido;

  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit() {
    try{
      const idString = this.route.snapshot.paramMap.get('id') || '0';
      this.order = await this.orderService.findOrderByUserIdAndPedidoId(Number(idString));
    }
    catch(error){
      console.log(error);
    }

  }

  get fullName(){
    return this.authService.getCurrentUserProfile()?.nombres +' ' +
           this.authService.getCurrentUserProfile()?.apellidos;
  }





}
