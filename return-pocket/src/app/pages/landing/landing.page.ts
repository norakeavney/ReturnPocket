import { Component, OnInit, OnDestroy } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ReceiptscanserviceService } from 'src/app/services/receiptscanservice.service';

/**
 * Landing page component that serves as the main entry point of the application.
 * Provides functionality for receipt scanning and navigation to other main features.
 */
@Component({
  standalone: false,
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit, OnDestroy {

  constructor(private receiptScan: ReceiptscanserviceService) { }

  /** Stores the path to the captured receipt image */
  imagePath: string | null = null;
  
  /** Controls the visibility of the pre-scan information modal */
  showInfoModal: boolean = false;
  
  /** Indicates whether a receipt scanning operation is in progress */
  isLoading: boolean = false;
  
  /** Message displayed to the user during loading operations */
  loadingMessage: string = 'Working our magic!';
  
  /** Reference to the loading timeout for cleanup purposes */
  private loadingTimeout: number | null = null;
  
  /**
   * Initiates the receipt capture flow by displaying the information modal.
   * The actual picture taking will happen after the modal is closed.
   */
  async takePicture() {
    this.showInfoModal = true;
  }

  /**
   * Utility method to clean up any active loading timeout.
   * Prevents memory leaks and ensures proper state management.
   */
  private clearLoadingTimeout() {
    if (this.loadingTimeout !== null) {
      window.clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }

  /**
   * Processes modal closing event and initiates the receipt capture workflow.
   * Controls the camera operation, receipt scanning process, and loading state management.
   */
  async handleModalClose() {
    this.showInfoModal = false;
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        this.imagePath = image.webPath;
        
        try {
          await this.receiptScan.scanAndSaveReceipt(
            this.imagePath, 
            () => {
              this.isLoading = true;
              
              this.clearLoadingTimeout();
              this.loadingTimeout = window.setTimeout(() => {
                this.loadingTimeout = null;
              }, 2000);
            }
          ).finally(() => {
            if (this.loadingTimeout !== null) {
              setTimeout(() => {
                this.isLoading = false;
                this.clearLoadingTimeout();
              }, 500);
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
   * Initializes the component and requests necessary device permissions.
   * Requests access to camera, location services, and notification capabilities.
   */
  async ngOnInit() {
    await Camera.requestPermissions();
    await Geolocation.requestPermissions();
    await LocalNotifications.requestPermissions();
  }
  
  /**
   * Performs cleanup when the component is being destroyed.
   * Ensures all timeouts are cleared and the loading state is reset.
   */
  ngOnDestroy() {
    this.clearLoadingTimeout();
    this.isLoading = false;
  }
}


