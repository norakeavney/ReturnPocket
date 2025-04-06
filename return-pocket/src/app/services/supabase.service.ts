import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  supabaseUrl: string = environment.SUPABASE_URL;
  supabaseKey: string = environment.SUPABASE_KEY;

  supabase = createClient(this.supabaseUrl, this.supabaseKey);


  constructor() { }

  async signUp(email: string, password: string, county: string, displayName: string) {

    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) throw error;
    const userID = data.user?.id;
    if (!userID) return;

    await this.supabase.from('users').insert({
      id: userID,
      display_name: displayName,
      location: county,
      total_points: 0,
    })


  }

  async signIn(email: string, password: string) {
    await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  async updateUserEmail(email: string) {
    await this.supabase.auth.updateUser({
      email: email
    })
  }

  async updateUserPass(password: string) {
    await this.supabase.auth.updateUser({
      password: password
    })
  }

  async syncData(points: number, storePoints: Record<string, number>) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    await this.supabase.from('users').update ({
      total_points: points,
      store_points: storePoints,
      last_sync: new Date().toISOString()
    }).eq('id', user.id);
    
  }
}
