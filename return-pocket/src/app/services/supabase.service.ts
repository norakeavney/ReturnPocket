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
      email,
      password
    });
  
    if (error) throw error;
  
    // Wait until user is fully confirmed
    const user = data.user;
    if (!user) throw new Error("User not created.");
  
    // Add to your users table
    const { error: insertError } = await this.supabase
      .from('users')
      .insert({
        id: user.id,
        email: email,
        display_name: displayName,
        user_county: county,
        total_points: 0,
        store_points: {}, // if you're using JSONB
        last_sync: new Date().toISOString()
      });
  
    if (insertError) throw insertError;
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

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
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
