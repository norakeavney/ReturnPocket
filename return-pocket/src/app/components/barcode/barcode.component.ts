import { Component, Input, OnInit, AfterViewInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqliteService } from 'src/app/services/sqlite.service';
import { RebuilderService } from 'src/app/services/rebuilder.service';

@Component({
  selector: 'app-barcode',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BarcodeComponent implements OnInit, AfterViewInit {

  @Input() receiptId!: number;
  public barcodeData: string | null = null;
  private barcodeInitialized = false;

  constructor(private sql: SqliteService, private builder: RebuilderService) {}

  async ngOnInit() {
    this.barcodeData = await this.sql.getBarcodeDataById(this.receiptId);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.renderBarcode();
    }, 500);
  }

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
