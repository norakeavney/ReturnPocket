import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Service that handles device location functionality and address resolution.
 * Uses Capacitor Geolocation plugin and OpenStreetMap's Nominatim API.
 */
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private http: HttpClient) { }

  /**
   * Retrieves the device's current geographic coordinates.
   * 
   * @returns Promise resolving to latitude and longitude coordinates
   */
  async getCurrentCoords(): Promise<{ latitude: number, longitude: number }> {
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  }

  /**
   * Converts geographic coordinates to a human-readable address
   * using OpenStreetMap's Nominatim reverse geocoding service.
   * 
   * @param latitude - Geographic latitude coordinate
   * @param longitude - Geographic longitude coordinate
   * @returns Promise resolving to a formatted address string or "Unknown"
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'return-pocket'
    });

    try {
      const res: any = await firstValueFrom(this.http.get(url, { headers }));

      const address = res?.address;
      if(!address) return "Unknown";

      const parts = [
        address.shop,
        address.road,
        address.city || address.town || address.village || address.suburb,
        address.postcode
      ].filter(Boolean);

      return parts.join(", ");

    } catch (error) {
      console.error("❌ Geolocation Error:", error);
      return "Unknown";
    }
  }

  /**
   * Convenience method that retrieves current location coordinates
   * and resolves them to a human-readable address in one operation.
   * 
   * @returns Promise resolving to a formatted address string or "Unknown"
   */
  async resolveLocation(): Promise<string> {
    const coords = await this.getCurrentCoords();
    return this.reverseGeocode(coords.latitude, coords.longitude);
  }
}
