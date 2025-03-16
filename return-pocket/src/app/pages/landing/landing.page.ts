import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { OcrService } from 'src/app/services/ocr.service';

@Component({
  standalone: false,
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(private ocrService: OcrService) { }

  processedImage: string | null = null;
  imagePath: string | null = null;
  
  async handleImage(imagePath: string) {
    try {
      this.processedImage = await this.ocrService.processImage(imagePath)
    } catch (error) {
      console.error('handleImage', error);
    }
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    this.imagePath = image.webPath || null;
  }

  async ngOnInit() {
    // When the app boots up for the first time, get permission for the camera
    await Camera.requestPermissions();
  }

}
