import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { OcrService } from 'src/app/services/ocr.service';
import { BarcodeService } from 'src/app/services/barcode.service';

@Component({
  standalone: false,
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(private ocrService: OcrService, private barcodeService: BarcodeService) { }

  processedImage: string | null = null;
  barcodeData: string | null = null;
  imagePath: string | null = null;
  OCRText: string | null = null;

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    if (image.webPath) {
      this.imagePath = image.webPath;
      this.processedImage = await this.ocrService.processImage(image.webPath);

      this.OCRText = await this.ocrService.runOCR(this.processedImage);

      this.barcodeData = await this.barcodeService.scanBarcode(this.processedImage);
    }

  }

  async ngOnInit() {
    // When the app boots up for the first time, get permission for the camera
    await Camera.requestPermissions();
  }

}
