import { Injectable } from '@angular/core';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerAndroidScanningLibrary
} from '@capacitor/barcode-scanner';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  constructor() {}

  async scanBarcode(): Promise<string | null> {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL, // Can be QRCODE, CODE128, etc.
        scanInstructions: "Make sure you can see the Barcode, Store Info & Amount",
        scanButton: true,
        scanText: "Store Me",
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
        scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
        android: {
          scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING
        }
      });

      return result.ScanResult || null; // Returns the barcode data
    } catch (error) {
      console.error("❌ Barcode Scan Error:", error);
      return null;
    }
  }
}
