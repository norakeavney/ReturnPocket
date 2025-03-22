import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private http: HttpClient) { }

  async getCurrentCoords(): Promise<{ latitude: number, longitude: number }> {
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  }

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

  async resolveLocation(): Promise<string> {
    const coords = await this.getCurrentCoords();
    return this.reverseGeocode(coords.latitude, coords.longitude);
  }
  
}
