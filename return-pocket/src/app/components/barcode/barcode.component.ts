import { Component, Input, OnInit, AfterViewInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqliteService } from 'src/app/services/sqlite.service';
import { RebuilderService } from 'src/app/services/rebuilder.service';

/**
 * Renders a barcode on a canvas element based on data retrieved from the database.
 * 
 * This component connects the SqliteService for data retrieval with the 
 * RebuilderService for actual barcode generation on a canvas element.
 */
@Component({
  selector: 'app-barcode',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BarcodeComponent implements OnInit, AfterViewInit {

  /**
   * Database ID of the receipt for which to generate a barcode.
   * This value must be provided by the parent component.
   */
  @Input() receiptId!: number;

  /**
   * Raw data used to generate the barcode.
   * Null indicates no barcode data is available.
   */
  public barcodeData: string | null = null;

  /**
   * Flag to prevent multiple initialization attempts of the same barcode.
   * Set to true once the barcode has been successfully generated.
   */
  private barcodeInitialized = false;

  /**
   * @param sql - Provides methods to interact with the SQLite database
   * @param builder - Provides barcode generation functionality
   */
  constructor(private sql: SqliteService, private builder: RebuilderService) {}

  /**
   * Fetches barcode data for the provided receipt ID when the component initializes.
   * Sets barcodeData to null if no data is found.
   */
  async ngOnInit() {
    this.barcodeData = await this.sql.getBarcodeDataById(this.receiptId);
  }

  /**
   * Initiates barcode rendering with a slight delay to ensure the DOM is fully rendered.
   * The delay ensures the canvas element is available in the DOM before attempting to draw.
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.renderBarcode();
    }, 500);
  }

  /**
   * Renders the barcode on the canvas element.
   * 
   * Only attempts rendering if:
   * 1. Valid barcode data exists
   * 2. The barcode hasn't already been initialized
   * 3. The canvas element is present in the DOM
   */
  private renderBarcode() {
    if (this.barcodeData && !this.barcodeInitialized) {
      const canvas = document.getElementById('barcode') as HTMLCanvasElement;
      if (canvas) {
        this.builder.generateBarcode(this.barcodeData, canvas);
        this.barcodeInitialized = true;
      }
    }
  }
}
