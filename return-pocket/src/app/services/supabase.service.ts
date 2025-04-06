import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { createClient } from '@supabase/supabase-js';
import { SqliteService } from './sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  supabaseUrl: string = environment.SUPABASE_URL;
  supabaseKey: string = environment.SUPABASE_KEY;

  supabase = createClient(this.supabaseUrl, this.supabaseKey);


  constructor(private sqlite: SqliteService) { }

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

  async syncData() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;
  
    const totalPoints = await this.sqlite.getUnsyncedPointsTotal();
    const storePoints = await this.sqlite.getUnsyncedStoreBreakdown();
    const receiptIds = await this.sqlite.getUnsyncedReceiptIds();
  
    if (totalPoints === 0 || !receiptIds.length) return;
  
    await this.supabase.rpc('increment_total_points', { points: totalPoints });
    await this.supabase.rpc('merge_store_points', { new_points: storePoints });
  
    await this.sqlite.markDataSynced(receiptIds);
  }
  
  
}
