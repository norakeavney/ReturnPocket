import { Injectable } from '@angular/core';
import { SqliteService,  Receipt } from './sqlite.service';
import { GeolocationService } from './geolocation.service';
import { BarcodeService } from './barcode.service';
import { OcrService } from './ocr.service';
import { ModalController } from '@ionic/angular';
import { ConfirmreceiptmodalComponent } from '../components/confirmreceiptmodal/confirmreceiptmodal.component';

/**
 * Service that orchestrates the complete receipt scanning and processing workflow.
 * Coordinates barcode scanning, OCR, geolocation, and database operations.
 */
@Injectable({
  providedIn: 'root'
})
export class ReceiptscanserviceService {

  /**
   * Initializes the receipt scanning service with required dependencies.
   * 
   * @param sqlite - Service for database operations
   * @param geo - Service for location resolution
   * @param bar - Service for barcode scanning
   * @param ocr - Service for image processing and text extraction
   * @param modalController - Controller for managing modal dialogs
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
   * Processes a receipt image through a complete workflow:
   * 1. Scans barcode from physical receipt
   * 2. Resolves current location
   * 3. Processes image using OCR to extract store and amount
   * 4. Calculates points based on amount
   * 5. Displays confirmation modal for user verification
   * 6. Saves verified receipt to database
   * 
   * @param imagePath - Path to the receipt image file
   * @param onBarcodeScanned - Optional callback triggered after barcode scanning completes
   * @returns Promise resolving to the saved receipt object or null if canceled
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
      points: points,
      total_amount: amount || 0,
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
   * Presents a modal dialog for the user to confirm and potentially modify
   * extracted receipt information before saving.
   * 
   * @param receipt - The receipt object with extracted information
   * @returns Promise resolving to true if confirmed, false if canceled
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
