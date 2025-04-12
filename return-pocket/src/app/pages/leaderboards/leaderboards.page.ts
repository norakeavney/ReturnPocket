import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/**
 * Interface representing a user in the leaderboard
 * Contains user information and scoring data
 */
interface LeaderboardUser {
  id: string;                          // Unique user identifier
  display_name: string;                // User's display name
  total_points: number;                // Total recycling points
  user_county: string;                 // User's county location
  rank?: number;                       // User's position in the leaderboard
  store_points?: Record<string, number>; // Points by store (store name -> points)
}

/**
 * Interface representing a selectable store option in the filters
 */
interface StoreOption {
  name: string;    // Display name of the store
  logo: string;    // Path to store logo image
  value: string;   // Store identifier used in data
}

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.page.html',
  styleUrls: ['./leaderboards.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LeaderboardsPage implements OnInit {
  /** Complete list of all users for the leaderboard */
  users: LeaderboardUser[] = [];
  
  /** Filtered subset of users based on selected filters */
  filteredUsers: LeaderboardUser[] = [];
  
  /** Top ranked users (up to 10) to display in the main leaderboard */
  topUsers: LeaderboardUser[] = [];
  
  /** Complete list of Irish counties for location filtering */
  irishCounties: string[] = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork',
    'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
  ];
  
  /** Available stores for filtering with their display information */
  storeOptions: StoreOption[] = [
    { name: 'Aldi', logo: '/assets/resources/store-logos/aldi.png', value: 'Aldi' },
    { name: 'Centra', logo: '/assets/resources/store-logos/centra.png', value: 'Centra' },
    { name: 'Dunnes', logo: '/assets/resources/store-logos/dunnes.png', value: 'Dunnes' },
    { name: 'Lidl', logo: '/assets/resources/store-logos/lidl.png', value: 'Lidl' },
    { name: 'Spar', logo: '/assets/resources/store-logos/spar.png', value: 'Spar' },
    { name: 'SuperValu', logo: '/assets/resources/store-logos/supervalu.png', value: 'SuperValu' },
    { name: 'Tesco', logo: '/assets/resources/store-logos/tesco.png', value: 'Tesco' },
    { name: 'Other', logo: '/assets/resources/store-logos/other.png', value: 'Other' }
  ];
  
  /** Controls visibility of the filter panel */
  showFilters: boolean = false;
  
  /** Currently selected county filter (empty string = no filter) */
  selectedCounty: string = '';
  
  /** Currently selected store filter (empty string = no filter) */
  selectedStore: string = '';
  
  /** Indicates whether leaderboard data is currently loading */
  isLoading: boolean = true;
  
  /** Error message to display if data loading fails */
  loadingError: string = '';
  
  /** ID of the currently logged in user */
  currentUserId: string | null = null;
  
  /** Current user's position in the leaderboard */
  currentUserRank: number = 0;
  
  /** Complete data for the current user */
  currentUserData: LeaderboardUser | null = null;
  
  /** Indicates if the current user is in the top 10 positions */
  isCurrentUserInTop10: boolean = false;
  
  /**
   * Constructor with dependency injection
   * @param navCtrl - Navigation controller for page routing
   * @param supabaseService - Service handling Supabase database operations
   */
  constructor(
    private navCtrl: NavController,
    private supabaseService: SupabaseService
  ) {}

  /**
   * Lifecycle hook that runs when the component initializes
   * Gets current user and loads leaderboard data
   */
  async ngOnInit() {
    // Get current user from authentication
    const user = await this.supabaseService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
    }
    
    await this.loadLeaderboardData();
  }
  
  /**
   * Fetches leaderboard data from the database and processes it
   * Sets up users list, rankings, and filtered views
   */
  async loadLeaderboardData() {
    this.isLoading = true;
    this.loadingError = '';
    
    try {
      // Fetch users data from Supabase, ordered by total points (descending)
      const { data, error } = await this.supabaseService.supabase
        .from('users')
        .select('id, display_name, total_points, user_county, store_points')
        .order('total_points', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        console.log('Leaderboard data received:', data);
        
        // Process user data: add rankings and ensure store_points is valid
        this.users = data.map((user, index) => ({
          ...user,
          rank: index + 1,
          store_points: user.store_points || {}
        }));
        
        // Initialize filtered users with all users
        this.filteredUsers = [...this.users];
        this.updateTopUsers();
        
        // Find and process current user information
        if (this.currentUserId) {
          this.currentUserData = this.users.find(u => u.id === this.currentUserId) || null;
          if (this.currentUserData) {
            this.currentUserRank = this.currentUserData.rank || 0;
            this.isCurrentUserInTop10 = this.currentUserRank <= 10;
          }
        }
      } else {
        console.log('No data returned from leaderboard query');
        this.users = [];
        this.filteredUsers = [];
        this.topUsers = [];
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      this.loadingError = 'Failed to load leaderboard data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Updates the top users list with the first 10 users from filtered results
   */
  updateTopUsers() {
    this.topUsers = this.filteredUsers.slice(0, 10);
    console.log('Top users updated:', this.topUsers);
  }
  
  /**
   * Toggles the visibility of the filter panel
   */
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  
  /**
   * Applies selected filters to the user list
   * Filters by county and/or store and updates rankings accordingly
   */
  applyFilters() {
    // Start with all users
    let filtered = [...this.users];
    
    // Apply county filter if selected
    if (this.selectedCounty) {
      filtered = filtered.filter(user => user.user_county === this.selectedCounty);
    }
    
    // Apply store filter if selected
    if (this.selectedStore) {
      // Filter users who have points from the selected store
      filtered = filtered.filter(user => 
        user.store_points && 
        user.store_points[this.selectedStore] !== undefined &&
        user.store_points[this.selectedStore] > 0
      );
      
      // When filtering by store, sort by that store's points instead of total points
      if (filtered.length > 0) {
        filtered.sort((a, b) => {
          const aPoints = a.store_points?.[this.selectedStore] || 0;
          const bPoints = b.store_points?.[this.selectedStore] || 0;
          return bPoints - aPoints;
        });
        
        // Recalculate ranks based on filtered and sorted results
        filtered = filtered.map((user, index) => ({
          ...user,
          rank: index + 1
        }));
      }
    }
    
    this.filteredUsers = filtered;
    this.updateTopUsers();
    
    // Update current user's rank in the filtered results
    if (this.currentUserId && this.currentUserData) {
      const userInFiltered = this.filteredUsers.find(u => u.id === this.currentUserId);
      if (userInFiltered) {
        this.currentUserRank = userInFiltered.rank || 0;
        this.isCurrentUserInTop10 = this.currentUserRank <= 10;
      } else {
        // User not in filtered results (doesn't match filter criteria)
        this.currentUserRank = 0;
        this.isCurrentUserInTop10 = false;
      }
    }
    
    // Auto-hide the filter panel after applying filters
    this.showFilters = false;
  }
  
  /**
   * Resets all filters and restores the original leaderboard
   */
  resetFilters() {
    this.selectedCounty = '';
    this.selectedStore = '';
    this.filteredUsers = [...this.users];
    this.updateTopUsers();
    
    // Restore current user's original rank
    if (this.currentUserId && this.currentUserData) {
      this.currentUserRank = this.currentUserData.rank || 0;
      this.isCurrentUserInTop10 = this.currentUserRank <= 10;
    }
    
    // Apply the reset filters
    this.applyFilters();
  }
  
  /**
   * Returns the logo URL for the currently selected store
   * @returns URL string for the store logo or empty string if no store selected
   */
  getSelectedStoreLogo(): string {
    if (!this.selectedStore) return '';
    const store = this.storeOptions.find(s => s.value === this.selectedStore);
    return store ? store.logo : '';
  }
  
  /**
   * Determines the appropriate badge color based on rank
   * @param rank - The user's position in the leaderboard
   * @returns CSS class string for the badge color
   */
  getBadgeColor(rank: number): string {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'medium';
  }
  
  /**
   * Formats the rank number with the appropriate ordinal suffix
   * @param rank - The user's position in the leaderboard
   * @returns Formatted rank string (e.g., "1st", "2nd", "3rd", "4th")
   */
  formatRank(rank: number): string {
    if (rank % 100 >= 11 && rank % 100 <= 13) {
      return `${rank}th`;
    }
    
    switch (rank % 10) {
      case 1: return `${rank}st`;
      case 2: return `${rank}nd`;
      case 3: return `${rank}rd`;
      default: return `${rank}th`;
    }
  }
  
  /**
   * Returns the appropriate points value based on current filters
   * Shows store-specific points when a store filter is applied
   * @param user - User data object
   * @returns Number of points to display
   */
  getPoints(user: LeaderboardUser): number {
    if (this.selectedStore && user.store_points) {
      return user.store_points[this.selectedStore] || 0;
    }
    return user.total_points;
  }
  
  /**
   * Checks if a user is the currently logged in user
   * Used to highlight the current user in the leaderboard
   * @param userId - User ID to check
   * @returns Boolean indicating if this is the current user
   */
  isCurrentUser(userId: string): boolean {
    return userId === this.currentUserId;
  }
  
  /**
   * Navigates back to the stats page
   */
  goBack() {
    this.navCtrl.navigateBack('/stats');
  }
}
