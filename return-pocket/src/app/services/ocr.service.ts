import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';

/**
 * Enum defining supported retail store names for recognition in receipts.
 */
enum StoreNames {
  Tesco = 'Tesco',
  Dunnes = 'Dunnes',
  Lidl = 'Lidl',
  Aldi = 'Aldi',
  Supervalu = 'Supervalu',
  Centra = 'Centra',
  Spar = 'Spar',
}

/**
 * Service that handles Optical Character Recognition (OCR) operations.
 * Processes receipt images to extract store names and monetary amounts.
 */
@Injectable({
  providedIn: 'root'
})
export class OcrService {

  /**
   * Lazily initialized Tesseract.js worker for text recognition.
   * Uses English language training data.
   */
  private workerPromise = createWorker('eng');

  constructor() { }

  /**
   * Processes a receipt image to optimize it for OCR text extraction.
   * Applies grayscale conversion and binarization to enhance text contrast.
   * 
   * @param imagePath - The path or data URL of the image to process
   * @returns Promise resolving to the processed image as a base64 data URL
   */
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

  /**
   * Executes the OCR process on a processed image to extract text,
   * then identifies store name and monetary amounts.
   * 
   * @param processedImage - Base64 encoded processed image data
   * @returns Promise resolving to an object with store name and highest amount found
   */
  async runOCR(processedImage: string): Promise<{ store: string | null; amount: number | null; }> {

    const worker = await this.workerPromise;

    const { data: { text } } = await worker.recognize(processedImage);

    return this.extractData(text);

  }

  /**
   * Analyzes OCR text to extract retail store name and monetary amounts.
   * Matches known store names and identifies currency values using regex patterns.
   * 
   * @param text - Raw text extracted from the image by OCR
   * @returns Object containing the identified store name and highest monetary amount
   */
  extractData(text: string):  {store: string | null; amount: number | null; } {

    const lines = text.toUpperCase().split('\n').map(line =>
      line.replace(/[^A-Z0-9€.: ]/g, '').trim()
    ).filter(Boolean);

    let storeMatch: string | null = null;
    let highestAmount: number | null = null;

    for (const line of lines) {
      if (!storeMatch) {
        storeMatch = Object.values(StoreNames).find(store =>
          line.includes(store.toUpperCase())
        ) || null;
      }
    
      const amounts = [...line.matchAll(/(?:€|EUR)?\s?(\d{1,3}\.\d{1,2})/g)];
      amounts.forEach(match => {
        const amount = parseFloat(match[1]);
        if (!highestAmount || amount > highestAmount) {
          highestAmount = amount;
        }
      });
    }

    if (!storeMatch) {
      storeMatch = 'Other';
    }

    return { store: storeMatch, amount: highestAmount };
  }
  
}
