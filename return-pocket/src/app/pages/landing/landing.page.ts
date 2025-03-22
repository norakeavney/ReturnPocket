import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { ReceiptscanserviceService } from 'src/app/services/receiptscanservice.service';
import { InfoModalComponent } from 'src/app/components/info-modal/info-modal.component';

@Component({
  standalone: false,
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(private receiptScan: ReceiptscanserviceService) { }

  imagePath: string | null = null;
  showInfoModal: boolean = false;

  async takePicture() {
    // Show the info modal first before taking a picture
    this.showInfoModal = true;
  }

  async handleModalClose() {
    // Hide the modal
    this.showInfoModal = false;
    
    // Now proceed with taking the picture
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    if (image.webPath) {
      this.imagePath = image.webPath;
      await this.receiptScan.scanAndSaveReceipt(this.imagePath);
    }
  }

  async ngOnInit() {
    // When the app boots up for the first time, get permissions
    await Camera.requestPermissions();
    await Geolocation.requestPermissions();
  }

}
