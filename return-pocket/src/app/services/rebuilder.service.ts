import { Injectable } from '@angular/core';
import * as JsBarcode from 'jsbarcode';

@Injectable({
  providedIn: 'root'
})
export class RebuilderService {

  constructor() { }

  generateBarcode(barcodeString: string, HTMLElement: HTMLCanvasElement) {
    console.log('Generating barcode with data:', barcodeString);
    
    try {
      // Clear the canvas first
      const ctx = HTMLElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, HTMLElement.width, HTMLElement.height);
      }
      
      // Ensure we have non-empty barcode data
      if (!barcodeString || barcodeString.trim().length === 0) {
        console.error('Empty barcode data provided');
        this.drawErrorMessage(HTMLElement);
        return;
      }
      
      // Generate the barcode with very explicit foreground and background colors
      JsBarcode(HTMLElement, barcodeString, {
        format: "CODE128",
        displayValue: true,
        width: 2,
        height: 80,
        margin: 10,
        background: "#ffffff", // White background
        lineColor: "#000000", // Black lines
        font: "monospace",
        fontSize: 16,
        textMargin: 8
      });
      
      console.log('Barcode successfully generated');
    } catch (error) {
      console.error('JsBarcode error:', error);
      this.drawErrorMessage(HTMLElement);
    }
  }
  
  private drawErrorMessage(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = "#ffeeee"; // Light red background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = "14px Arial";
      ctx.fillStyle = "#cc0000"; // Red text
      ctx.textAlign = "center";
      ctx.fillText("Error generating barcode", canvas.width/2, canvas.height/2);
    }
  }
}
