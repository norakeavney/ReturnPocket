import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReceiptDetailPageRoutingModule } from './receipt-detail-routing.module';

import { ReceiptDetailPage } from './receipt-detail.page';
import { BarcodeComponent } from "../../components/barcode/barcode.component";
import { ReminderPickerComponent } from "../../components/reminder-picker/reminder-picker.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReceiptDetailPageRoutingModule,
    BarcodeComponent,
    ReminderPickerComponent
],
  declarations: [ReceiptDetailPage]
})
export class ReceiptDetailPageModule {}
