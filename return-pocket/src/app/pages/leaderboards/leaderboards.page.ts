import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface LeaderboardUser {
  id: string;
  display_name: string;
  total_points: number;
  user_county: string;
  rank?: number;
  store_points?: Record<string, number>;
}

interface StoreOption {
  name: string;
  logo: string;
  value: string;
}

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.page.html',
  styleUrls: ['./leaderboards.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LeaderboardsPage implements OnInit {
  users: LeaderboardUser[] = [];
  filteredUsers: LeaderboardUser[] = [];
  topUsers: LeaderboardUser[] = []; // To store top 10 users
  
  // Predefined list of all Irish counties
  irishCounties: string[] = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork',
    'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
  ];
  
  // Predefined store options with logos
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
  
  showFilters: boolean = false;
  selectedCounty: string = '';
  selectedStore: string = '';
  
  isLoading: boolean = true;
  loadingError: string = '';
  
  currentUserId: string | null = null;
  currentUserRank: number = 0;
  currentUserData: LeaderboardUser | null = null;
  isCurrentUserInTop10: boolean = false;
  
  constructor(
    private navCtrl: NavController,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    // Get current user
    const user = await this.supabaseService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
    }
    
    await this.loadLeaderboardData();
  }
  
  async loadLeaderboardData() {
    this.isLoading = true;
    this.loadingError = '';
    
    try {
      // Fetch users ordered by total points
      const { data, error } = await this.supabaseService.supabase
        .from('users')
        .select('id, display_name, total_points, user_county, store_points')
        .order('total_points', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        console.log('Leaderboard data received:', data); // Debug log to check fetched data
        
        // Add rank to each user
        this.users = data.map((user, index) => ({
          ...user,
          rank: index + 1,
          // Ensure store_points is an object
          store_points: user.store_points || {}
        }));
        
        // Initialize filtered users
        this.filteredUsers = [...this.users];
        this.updateTopUsers();
        
        // Find current user data and rank
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
  
  updateTopUsers() {
    // Update the top 10 users from filtered users
    this.topUsers = this.filteredUsers.slice(0, 10);
    console.log('Top users updated:', this.topUsers); // Debug log to check top users
  }
  
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  
  applyFilters() {
    // Start with all users
    let filtered = [...this.users];
    
    // Filter by county if selected
    if (this.selectedCounty) {
      filtered = filtered.filter(user => user.user_county === this.selectedCounty);
    }
    
    // Filter by store if selected
    if (this.selectedStore) {
      filtered = filtered.filter(user => 
        user.store_points && 
        user.store_points[this.selectedStore] !== undefined &&
        user.store_points[this.selectedStore] > 0
      );
      
      // If we're filtering by store, sort by that store's points
      if (filtered.length > 0) {
        filtered.sort((a, b) => {
          const aPoints = a.store_points?.[this.selectedStore] || 0;
          const bPoints = b.store_points?.[this.selectedStore] || 0;
          return bPoints - aPoints;
        });
        
        // Update ranks based on store points
        filtered = filtered.map((user, index) => ({
          ...user,
          rank: index + 1
        }));
      }
    }
    
    this.filteredUsers = filtered;
    this.updateTopUsers();
    
    // Update current user info after filtering
    if (this.currentUserId && this.currentUserData) {
      const userInFiltered = this.filteredUsers.find(u => u.id === this.currentUserId);
      if (userInFiltered) {
        this.currentUserRank = userInFiltered.rank || 0;
        this.isCurrentUserInTop10 = this.currentUserRank <= 10;
      } else {
        // User not in filtered results
        this.currentUserRank = 0;
        this.isCurrentUserInTop10 = false;
      }
    }
    
    // Hide filters after applying
    this.showFilters = false;
  }
  
  resetFilters() {
    this.selectedCounty = '';
    this.selectedStore = '';
    this.filteredUsers = [...this.users];
    this.updateTopUsers();
    
    // Reset current user rank info
    if (this.currentUserId && this.currentUserData) {
      this.currentUserRank = this.currentUserData.rank || 0;
      this.isCurrentUserInTop10 = this.currentUserRank <= 10;
    }
    
    // Apply filter changes
    this.applyFilters();
  }
  
  // Get the selected store logo
  getSelectedStoreLogo(): string {
    if (!this.selectedStore) return '';
    const store = this.storeOptions.find(s => s.value === this.selectedStore);
    return store ? store.logo : '';
  }
  
  // Get badge color based on rank
  getBadgeColor(rank: number): string {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'medium';
  }
  
  // Display rank with appropriate suffix (1st, 2nd, 3rd, etc.)
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
  
  // Get points to display based on filter
  getPoints(user: LeaderboardUser): number {
    if (this.selectedStore && user.store_points) {
      return user.store_points[this.selectedStore] || 0;
    }
    return user.total_points;
  }
  
  // Return true if the user is the current logged in user
  isCurrentUser(userId: string): boolean {
    return userId === this.currentUserId;
  }
  
  goBack() {
    this.navCtrl.navigateBack('/stats');
  }
}
