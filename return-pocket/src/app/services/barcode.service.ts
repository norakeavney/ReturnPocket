import { Injectable } from '@angular/core';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerAndroidScanningLibrary
} from '@capacitor/barcode-scanner';

/**
 * Service for handling barcode scanning functionality using Capacitor Barcode Scanner plugin.
 */
@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  constructor() {}

  /**
   * Initiates a barcode scanning process and returns the scanned barcode data.
   * 
   * @returns A promise that resolves to the scanned barcode data as a string, or `null` if scanning fails.
   * @throws Logs an error to the console if the scanning process encounters an issue.
   */
  async scanBarcode(): Promise<string | null> {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL, // Can be QRCODE, CODE128, etc.
        scanInstructions: "Scan your barcode!", // Instructions displayed to the user.
        scanButton: false, // Whether to show a scan button.
        scanText: "Store Me", // Text displayed during scanning.
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK, // Use the back camera.
        scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE, // Adjust orientation automatically.
        android: {
          scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING // Android-specific scanning library.
        }
      });

      return result.ScanResult || null; // Returns the barcode data
    } catch (error) {
      console.error("❌ Barcode Scan Error:", error);
      return null;
    }
  }
}
