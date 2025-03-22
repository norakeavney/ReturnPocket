import { Injectable } from '@angular/core';
import { SqliteService,  Receipt } from './sqlite.service';
import { GeolocationService } from './geolocation.service';
import { BarcodeService } from './barcode.service';
import { OcrService } from './ocr.service';
import { ModalController } from '@ionic/angular';
import { ConfirmreceiptmodalComponent } from '../components/confirmreceiptmodal/confirmreceiptmodal.component';


@Injectable({
  providedIn: 'root'
})
export class ReceiptscanserviceService {

  constructor(
    private sqlite: SqliteService, 
    private geo: GeolocationService, 
    private bar: BarcodeService, 
    private ocr: OcrService,
    private modalController: ModalController
  ) { 
    console.log("Services injected");
  }

  async scanAndSaveReceipt(imagePath: string) {

    const barcode = await this.bar.scanBarcode();
    const location = await this.geo.resolveLocation();
    const processedImage = await this.ocr.processImage(imagePath);
    const { store, amount } = await this.ocr.runOCR(processedImage);

    const bottleCount = amount ? Math.ceil(amount / 0.15) : 0;

    const receipt: Receipt = {
      store_name: store || 'Unknown',
      location,
      bottle_count: bottleCount,
      total_amount: amount || 0,
      img_path: imagePath,
      barcode_data: barcode || '',
      timestamp: new Date().toISOString()
    };

    // Show the confirmation modal
    const confirmed = await this.showConfirmationModal(receipt);
    
    if (confirmed) {
      await this.sqlite.addReceipt(receipt);
      console.log('Receipt saved:', receipt);
      return receipt;
    } else {
      console.log('Receipt confirmation canceled');
      return null;
    }
  }
  
  private async showConfirmationModal(receipt: Receipt): Promise<boolean> {
    const modal = await this.modalController.create({
      component: ConfirmreceiptmodalComponent,
      componentProps: {
        receipt: {...receipt}  // Pass a copy to avoid modifying original before confirmation
      },
      cssClass: 'receipt-confirmation-modal'
    });
    
    await modal.present();
    
    return new Promise<boolean>(resolve => {
      modal.onDidDismiss().then((result) => {
        if (result.data) {
          // If data exists, it means the user confirmed and potentially modified the receipt
          Object.assign(receipt, result.data);
          resolve(true);
        } else {
          // No data means the user cancelled
          resolve(false);
        }
      });
    });
  }
}
