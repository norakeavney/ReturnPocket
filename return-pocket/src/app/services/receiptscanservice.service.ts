import { Injectable } from '@angular/core';
import { SqliteService,  Receipt } from './sqlite.service';
import { GeolocationService } from './geolocation.service';
import { BarcodeService } from './barcode.service';
import { OcrService } from './ocr.service';
import { ModalController } from '@ionic/angular';
import { ConfirmreceiptmodalComponent } from '../components/confirmreceiptmodal/confirmreceiptmodal.component';

/**
 * Service responsible for scanning receipts, extracting data using OCR,
 * and saving the receipt information into the database.
 */
@Injectable({
  providedIn: 'root'
})
export class ReceiptscanserviceService {

  /**
   * Constructor to inject required services.
   * @param sqlite Service for interacting with the SQLite database.
   * @param geo Service for resolving the user's geolocation.
   * @param bar Service for scanning barcodes.
   * @param ocr Service for processing images and extracting text using OCR.
   * @param modalController Controller for managing modals in the application.
   */
  constructor(
    private sqlite: SqliteService, 
    private geo: GeolocationService, 
    private bar: BarcodeService, 
    private ocr: OcrService,
    private modalController: ModalController
  ) { 
    console.log("Services injected");
  }

  /**
   * Scans a receipt, extracts data using OCR, and saves it to the database.
   * @param imagePath Path to the receipt image.
   * @param onBarcodeScanned Optional callback triggered after barcode scanning.
   * @returns The saved receipt object or null if the user cancels confirmation.
   */
  async scanAndSaveReceipt(imagePath: string, onBarcodeScanned?: () => void) {
    // First scan the barcode
    const barcode = await this.bar.scanBarcode();
    
    // Now that we have the barcode, trigger the loading state in the parent component
    if (onBarcodeScanned) {
      onBarcodeScanned();
    }

    // Continue with the rest of the processing
    const location = await this.geo.resolveLocation();
    const processedImage = await this.ocr.processImage(imagePath);
    const { store, amount } = await this.ocr.runOCR(processedImage);

    // Calculate points as total_amount * 100 instead of bottle count
    const points = amount ? Math.round(amount * 100) : 0;

    const receipt: Receipt = {
      store_name: store || 'Unknown',
      location,
      bottle_count: points, // Using bottle_count field for points
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
  
  /**
   * Displays a confirmation modal for the receipt.
   * @param receipt The receipt object to confirm.
   * @returns A promise that resolves to true if the user confirms, or false if they cancel.
   */
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
