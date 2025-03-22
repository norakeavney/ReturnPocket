import { Injectable } from '@angular/core';
import { SqliteService,  Receipt } from './sqlite.service';
import { GeolocationService } from './geolocation.service';
import { BarcodeService } from './barcode.service';
import { OcrService } from './ocr.service';


@Injectable({
  providedIn: 'root'
})
export class ReceiptscanserviceService {

  constructor(
    private sqlite: SqliteService, 
    private geo: GeolocationService, 
    private bar: BarcodeService, 
    private ocr: OcrService
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

    //await this.sqlite.addReceipt(receipt);
    console.log(receipt);
  }

}
