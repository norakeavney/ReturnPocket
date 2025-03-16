import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';

export enum StoreNames {
  Tesco = 'Tesco',
  Dunnes = 'Dunnes',
  Lidl = 'Lidl',
  Aldi = 'Aldi',
  Supervalu = 'Supervalu',
  Centra = 'Centra',
  Spar = 'Spar',
}

@Injectable({
  providedIn: 'root'
})

export class OcrService {

  private workerPromise = createWorker('eng');

  constructor() { }

  processImage(imagePath: string): Promise<string> {
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject('Could not create canvas 2d context');
        return;
      }

      img.src = imagePath;
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to greyscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg < 128 ? 0 : 255;
          data[i + 1] = avg <128 ? 0 : 255;
          data[i + 2] = avg < 128 ? 0 : 255;
        }

          ctx?.putImageData(imageData, 0, 0);

          const processedImage = canvas.toDataURL('image/png');
          resolve(processedImage);
      };

      img.onerror = (error) => {
        reject(error);
      };
    });

  }

  async runOCR(processedImage: string): Promise<string> {

    const worker = await this.workerPromise;

    const { data: { text } } = await worker.recognize(processedImage);

    return this.scrubText(text);

  }
  scrubText(text: string): string {
    // Convert to uppercase
    text = text.toUpperCase();
  
    // Split text into an array of lines
    let splitText: string[] = text.split('\n');
  
    for (let i = 0; i < splitText.length; i++) {
      let line = splitText[i];
  
      // Remove all special characters except € . and :
      line = line.replace(/[^A-Z0-9€.: ]/g, '');
  
      // Trim spaces
      splitText[i] = line.trim();
    }
    console.log(splitText.filter(line => line.length > 0).join("\n"));
    return splitText.filter(line => line.length > 0).join("\n"); // Remove empty lines
  }
  
  
}
