import { Injectable } from '@angular/core';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerAndroidScanningLibrary
} from '@capacitor/barcode-scanner';

/**
 * Service that provides barcode scanning functionality using
 * the Capacitor Barcode Scanner plugin.
 */
@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  constructor() {}

  /**
   * Launches the device camera interface to scan a barcode.
   * Configures the scanner with appropriate settings for receipt barcodes
   * and handles the scanning process.
   * 
   * @returns Promise resolving to the scanned barcode data string or null if scanning fails/cancels
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
      console.error("Ensure the device camera is accessible and permissions are granted.");
      return null;
    }
  }
}
