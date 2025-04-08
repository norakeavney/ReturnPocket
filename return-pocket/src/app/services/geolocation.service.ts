import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Service to handle geolocation-related functionality, including retrieving
 * the user's current coordinates and resolving location details using reverse geocoding.
 */
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private http: HttpClient) { }

  /**
   * Retrieves the current geographic coordinates (latitude and longitude) of the user.
   * 
   * @returns A promise that resolves to an object containing latitude and longitude.
   */
  async getCurrentCoords(): Promise<{ latitude: number, longitude: number }> {
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  }

  /**
   * Performs reverse geocoding to resolve a human-readable address from geographic coordinates.
   * 
   * @param latitude - The latitude of the location.
   * @param longitude - The longitude of the location.
   * @returns A promise that resolves to a string representing the address, or "Unknown" if not found.
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
   * Resolves the user's current location to a human-readable address.
   * Combines `getCurrentCoords` and `reverseGeocode` methods.
   * 
   * @returns A promise that resolves to a string representing the address, or "Unknown" if not found.
   */
  async resolveLocation(): Promise<string> {
    const coords = await this.getCurrentCoords();
    return this.reverseGeocode(coords.latitude, coords.longitude);
  }
  
}
