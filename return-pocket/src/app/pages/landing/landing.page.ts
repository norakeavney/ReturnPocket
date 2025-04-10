import { Component, OnInit, OnDestroy } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ReceiptscanserviceService } from 'src/app/services/receiptscanservice.service';

@Component({
  standalone: false,
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit, OnDestroy {

  constructor(private receiptScan: ReceiptscanserviceService) { }

  imagePath: string | null = null;
  showInfoModal: boolean = false;
  isLoading: boolean = false;
  loadingMessage: string = 'Working our magic!';
  private loadingTimeout: number | null = null;
  
  /**
   * Displays the info modal before initiating the picture-taking process.
   */
  async takePicture() {
    // Show the info modal first before taking a picture
    this.showInfoModal = true;
  }

  /**
   * Clears any active loading timeout to prevent memory leaks or unintended behavior.
   */
  private clearLoadingTimeout() {
    if (this.loadingTimeout !== null) {
      window.clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }

  /**
   * Handles the closing of the info modal and proceeds with taking a picture.
   * Initiates receipt scanning and manages the loading state.
   */
  async handleModalClose() {
    // Hide the modal
    this.showInfoModal = false;
    
    try {
      // Now proceed with taking the picture
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        this.imagePath = image.webPath;
        
        try {
          // Start processing the receipt - let the scanAndSaveReceipt method notify us when to show loading
          await this.receiptScan.scanAndSaveReceipt(
            this.imagePath, 
            () => {
              // This callback is called after barcode is scanned to start showing loading state
              this.isLoading = true;
              
              // Ensure loading shows for at least 2 seconds for better UX
              this.clearLoadingTimeout();
              this.loadingTimeout = window.setTimeout(() => {
                this.loadingTimeout = null; // Clear reference when done
              }, 2000);
            }
          ).finally(() => {
            // Wait a little if needed to ensure loading shows for minimum time
            if (this.loadingTimeout !== null) {
              setTimeout(() => {
                this.isLoading = false;
                this.clearLoadingTimeout();
              }, 500); // Small buffer to ensure minimum display time
            } else {
              this.isLoading = false;
            }
          });
          
        } catch (error) {
          console.error('Error during receipt processing:', error);
          this.isLoading = false;
          this.clearLoadingTimeout();
        }
      }
    } catch (error) {
      console.error('Error during picture taking:', error);
      this.isLoading = false;
      this.clearLoadingTimeout();
    }
  }

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Requests necessary permissions for Camera, Geolocation, and Local Notifications.
   */
  async ngOnInit() {
    // When the app boots up for the first time, get permissions
    await Camera.requestPermissions();
    await Geolocation.requestPermissions();
    await LocalNotifications.requestPermissions();
  }
  
  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Ensures cleanup of timeouts and resets the loading state.
   */
  ngOnDestroy() {
    this.clearLoadingTimeout();
    this.isLoading = false;
  }

  
}


