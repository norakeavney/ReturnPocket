import { Injectable } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private codeReader = new BrowserMultiFormatReader();

  constructor() { }


  async scanBarcode(imagePath: string): Promise<string> {
    try{

      const imgElement = document.createElement('img');
      imgElement.src = imagePath;

      await new Promise((resolve) => imgElement.onload = resolve);
      
      const result  = await this.codeReader.decodeFromImageElement(imgElement);
      return result ? result.getText() : '';
      
    } catch (error) {
      console.error('scanBarcode', error);
      return '';
    }
  
  }

}
