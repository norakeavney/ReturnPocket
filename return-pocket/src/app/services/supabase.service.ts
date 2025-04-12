import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { createClient } from '@supabase/supabase-js';
import { SqliteService } from './sqlite.service';

/**
 * Service that handles all interactions with the Supabase backend.
 * Provides methods for authentication, user management, and data synchronization.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  supabaseUrl: string = environment.SUPABASE_URL;
  supabaseKey: string = environment.SUPABASE_KEY;

  /** Initialized Supabase client instance */
  supabase = createClient(this.supabaseUrl, this.supabaseKey);

  constructor(private sqlite: SqliteService) { }

  /**
   * Registers a new user and creates their profile in the database.
   * 
   * @param email - User's email address
   * @param password - User's chosen password
   * @param county - User's county location
   * @param displayName - User's display name
   * @throws Error if user creation or profile insertion fails
   */
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
  
  /**
   * Authenticates a user with email and password.
   * 
   * @param email - User's email address
   * @param password - User's password
   */
  async signIn(email: string, password: string) {
    await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
  }

  /**
   * Signs the current user out of the application.
   */
  async signOut() {
    await this.supabase.auth.signOut();
  }

  /**
   * Retrieves the currently authenticated user.
   * 
   * @returns The user object if authenticated, null otherwise
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  }  

  /**
   * Updates the email address for the currently authenticated user.
   * 
   * @param email - New email address to set
   */
  async updateUserEmail(email: string) {
    await this.supabase.auth.updateUser({
      email: email
    })
  }

  /**
   * Updates the password for the currently authenticated user.
   * 
   * @param password - New password to set
   */
  async updateUserPass(password: string) {
    await this.supabase.auth.updateUser({
      password: password
    })
  }

  /**
   * Synchronizes local receipt data with the remote Supabase database.
   * Uploads unsynced points, store breakdowns, and marks synced records.
   * Only performs sync if there are valid points and receipts to upload.
   */
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
