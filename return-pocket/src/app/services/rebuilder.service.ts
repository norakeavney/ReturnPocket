import { Injectable } from '@angular/core';
import * as JsBarcode from 'jsbarcode';

/**
 * Service responsible for generating visual barcode representations
 * from stored barcode data.
 */
@Injectable({
  providedIn: 'root'
})
export class RebuilderService {

  constructor() { }

  /**
   * Generates and renders a visual barcode on a canvas element.
   * Uses CODE128 format with customized display settings for optimal
   * scanning by retail barcode readers.
   * 
   * @param barcodeString - The string data to encode in the barcode.
   * @param HTMLElement - The HTMLCanvasElement where the barcode will be rendered.
   */
  generateBarcode(barcodeString: string, HTMLElement: HTMLCanvasElement) {
    console.log('Generating barcode with data:', barcodeString);
    
    try {
      const ctx = HTMLElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, HTMLElement.width, HTMLElement.height);
      }
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
    }
  }
}
