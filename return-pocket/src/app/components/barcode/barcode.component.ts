import { Component, Input, OnInit, AfterViewInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqliteService } from 'src/app/services/sqlite.service';
import { RebuilderService } from 'src/app/services/rebuilder.service';

/**
 * BarcodeComponent is responsible for rendering a barcode on a canvas element.
 * It fetches barcode data using the SqliteService and generates the barcode
 * using the RebuilderService.
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
   * The ID of the receipt for which the barcode is to be generated.
   */
  @Input() receiptId!: number;

  /**
   * The data used to generate the barcode.
   */
  public barcodeData: string | null = null;

  /**
   * A flag to ensure the barcode is only initialized once.
   */
  private barcodeInitialized = false;

  /**
   * Constructor to inject required services.
   * @param sql - Service to interact with SQLite database.
   * @param builder - Service to generate the barcode.
   */
  constructor(private sql: SqliteService, private builder: RebuilderService) {}

  /**
   * Lifecycle hook that is called after the component is initialized.
   * Fetches the barcode data for the given receipt ID.
   */
  async ngOnInit() {
    this.barcodeData = await this.sql.getBarcodeDataById(this.receiptId);
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Delays the rendering of the barcode to ensure the canvas element is available.
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.renderBarcode();
    }, 500);
  }

  /**
   * Renders the barcode on a canvas element if the barcode data is available
   * and the barcode has not already been initialized.
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
