import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReceiptsPageRoutingModule } from './receipts-routing.module';

import { ReceiptsPage } from './receipts.page';
import { HeaderComponent } from "../../components/header/header.component";
import { ReceiptCardComponent } from 'src/app/components/receipt-card/receipt-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReceiptsPageRoutingModule,
    HeaderComponent,
    ReceiptCardComponent
  ],
  declarations: [ReceiptsPage]
})
export class ReceiptsPageModule {}
