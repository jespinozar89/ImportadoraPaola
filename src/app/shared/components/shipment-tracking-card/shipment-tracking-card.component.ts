import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Envio, HistorialEnvio } from '@/shared/models/shipping.model';

@Component({
  selector: 'app-shipment-tracking-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-tracking-card.component.html',
  styleUrl: './shipment-tracking-card.component.scss'
})
export class ShipmentTrackingCardComponent implements OnChanges {
  @Input() shipment: Envio | null = null;
  @Input() isLoading = false;
  @Input() loadError = false;
  @Input() allowAssociation = false;
  @Input() savingShipment = false;
  @Input() showRecipientRut = false;

  @Output() refresh = new EventEmitter<void>();
  @Output() associateShipment = new EventEmitter<string>();
  @Output() updateFreightNumber = new EventEmitter<string>();

  trackingNumber = '';
  replacementFreightNumber = '';
  historyExpanded = false;
  editingFreightNumber = false;

  ngOnChanges(changes: SimpleChanges): void {
    const shipmentChange = changes['shipment'];
    if (
      shipmentChange &&
      shipmentChange.previousValue?.numero_flete !== shipmentChange.currentValue?.numero_flete
    ) {
      this.editingFreightNumber = false;
      this.replacementFreightNumber = '';
    }
  }

  get shipmentHistory(): HistorialEnvio[] {
    return [...(this.shipment?.historial || [])].sort(
      (first, second) => new Date(first.fecha_evento).getTime() - new Date(second.fecha_evento).getTime()
    );
  }

  onSubmit(): void {
    const number = this.trackingNumber.trim();
    if (number && !this.savingShipment) {
      this.associateShipment.emit(number);
    }
  }

  startEditingFreightNumber(): void {
    if (!this.shipment || !this.allowAssociation || this.savingShipment) {
      return;
    }

    this.replacementFreightNumber = this.shipment.numero_flete;
    this.editingFreightNumber = true;
  }

  cancelEditingFreightNumber(): void {
    this.editingFreightNumber = false;
    this.replacementFreightNumber = '';
  }

  onFreightNumberSubmit(): void {
    const number = this.replacementFreightNumber.trim();
    if (
      number &&
      number !== this.shipment?.numero_flete &&
      !this.savingShipment
    ) {
      this.updateFreightNumber.emit(number);
    }
  }
}
