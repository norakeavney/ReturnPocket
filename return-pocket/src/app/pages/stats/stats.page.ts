import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';

/**
 * Represents a statistical card displayed in the UI.
 * Contains information about the statistic type, value, and visual properties.
 */
interface StatCard {
  /** The title of the statistic */
  title: string;
  /** The actual value (used for data operations) */
  value: string | number;
  /** The value currently being displayed (used for animations) */
  displayValue: string | number;
  /** The final numeric value the animation will reach */
  targetValue: number;
  /** Icon name from Ionic icons to visually represent the statistic */
  icon: string;
  /** Color name from Ionic color palette for the statistic */
  color: string;
  /** Optional prefix for the displayed value (e.g., currency symbol) */
  prefix?: string;
  /** Optional suffix for the displayed value (e.g., units) */
  suffix?: string;
  /** Number of decimal places to show in the formatted value */
  decimals?: number;
}

/**
 * Represents an achievement that can be unlocked by the user.
 */
interface Achievement {
  /** The name of the achievement */
  name: string;
  /** Description explaining how to earn the achievement */
  description: string;
  /** Icon name from Ionic icons to visually represent the achievement */
  icon: string;
  /** Whether the user has earned this achievement */
  achieved: boolean;
}

/**
 * StatsPage displays user statistics, achievements, and environmental impact
 * related to bottle recycling activity. It includes animated counters, 
 * user level progression, and personalized achievements.
 */
@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class StatsPage implements OnInit {
  /** User's display name retrieved from profile */
  userName = '';
  /** Text representation of the user's current level */
  userLevel = '';
  /** Numeric representation of the user's current level (1-5) */
  userLevelNumber = 1;
  /** Total points accumulated by the user */
  userPoints = 0;
  /** Points required to reach the next level */
  pointsToNextLevel = 100;
  /** Progress toward next level as a value between 0 and 1 */
  userLevelProgress = 0;
  /** Whether the user is currently logged in */
  isLoggedIn = false;
  /** Whether the authentication status has been checked */
  isAuthChecked = false;
  /** Total number of bottles recycled by the user */
  totalBottles = 0;
  /** Total money saved by the user through recycling (in currency units) */
  totalSaved = 0;
  /** Total number of recycling receipts generated */
  totalReceipts = 0;
  /** Stores ranked by number of bottles recycled at each location */
  topStores: { name: string; count: number }[] = [];
  /** Collection of statistic cards to display in the UI */
  statCards: StatCard[] = [];
  /** Collection of achievements the user can unlock */
  achievements: Achievement[] = [
    {
      name: 'First Return',
      description: 'Return your first bottle',
      icon: 'trophy',
      achieved: false
    },
    {
      name: 'Dedicated Recycler',
      description: 'Return bottles 5 days in a row',
      icon: 'calendar',
      achieved: false
    },
    {
      name: 'Century Club',
      description: 'Return 100 bottles in total',
      icon: 'trophy',
      achieved: false
    },
    {
      name: 'Eco Warrior',
      description: 'Return bottles from 10 different locations',
      icon: 'earth',
      achieved: false
    }
  ];
  /** Duration of statistical animations in milliseconds */
  animationDuration = 1500;
  /** Number of animation frames for smooth counting effect */
  animationFrames = 20;
  /** Current display value for bottles count during animation */
  displayBottles = 0;
  /** Current display value for CO₂ reduction during animation */
  displayCO2 = '0';
  /** Current display value for landfill space saved during animation */
  displayLandfill = '0';

  /**
   * Creates an instance of the StatsPage component.
   * 
   * @param sqliteService - Service for accessing local database records
   * @param navCtrl - Controller for navigation between pages
   * @param supabaseService - Service for interacting with Supabase backend
   */
  constructor(
    private sqliteService: SqliteService,
    private navCtrl: NavController,
    private supabaseService: SupabaseService
  ) { }

  /**
   * Initializes the component, checks authentication status and loads statistics.
   */
  async ngOnInit() {
    await this.checkAuthStatus();
    this.loadStats();
  }

  /**
   * Refreshes data when the page is about to be displayed.
   * Ensures fresh authentication status and updated statistics.
   */
  async ionViewWillEnter() {
    this.isAuthChecked = false;
    await this.checkAuthStatus();
    this.loadStats();
  }

  /**
   * Verifies the current authentication state and loads user profile data.
   * Updates user level, points, and progress information when logged in.
   */
  async checkAuthStatus() {
    const user = await this.supabaseService.getCurrentUser();
    this.isLoggedIn = !!user;
    this.isAuthChecked = true;
    
    if (this.isLoggedIn) {
      try {
        const { data, error } = await this.supabaseService.supabase
          .from('users')
          .select('display_name, total_points, user_county')
          .eq('id', user?.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          this.userName = data.display_name || 'Recycler';
          this.userPoints = data.total_points || 0;
          this.calculateLevel(this.userPoints);
        } else {
          this.resetUserData();
        }
      } catch (error) {
        this.resetUserData();
      }
    } else {
      this.resetUserData();
    }
  }

  /**
   * Calculates the user's level and progress based on accumulated points.
   * Sets appropriate level titles and progress metrics.
   * 
   * @param points - The user's current point total
   */
  calculateLevel(points: number) {
    if (points >= 1000) {
      this.userLevel = 'Recycling Champion';
      this.userLevelNumber = 5;
      this.pointsToNextLevel = 1000;
      this.userLevelProgress = 1;
    } else if (points >= 500) {
      this.userLevel = 'Recycling Expert';
      this.userLevelNumber = 4;
      this.pointsToNextLevel = 1000;
      this.userLevelProgress = (points - 500) / 500;
    } else if (points >= 250) {
      this.userLevel = 'Recycling Pro';
      this.userLevelNumber = 3;
      this.pointsToNextLevel = 500;
      this.userLevelProgress = (points - 250) / 250;
    } else if (points >= 100) {
      this.userLevel = 'Dedicated Recycler';
      this.userLevelNumber = 2;
      this.pointsToNextLevel = 250;
      this.userLevelProgress = (points - 100) / 150;
    } else {
      this.userLevel = 'Recycling Beginner';
      this.userLevelNumber = 1;
      this.pointsToNextLevel = 100;
      this.userLevelProgress = points / 100;
    }
  }

  /**
   * Determines the appropriate color for the user's level indicator.
   * Higher levels receive more prestigious colors.
   * 
   * @returns CSS color value corresponding to the user's level
   */
  getLevelColor() {
    switch(this.userLevelNumber) {
      case 1:
        return '#6c757d'; // Gray/silver for beginners
      case 2:
        return '#3498db'; // Blue
      case 3:
        return '#2ecc71'; // Green
      case 4:
        return '#f1c40f'; // Gold/yellow
      case 5:
        return '#e74c3c'; // Red for champion
      default:
        return '#6c757d';
    }
  }

  /**
   * Loads and calculates statistics from receipt data.
   * Processes receipt information to generate statistical cards,
   * store rankings, and environmental impact metrics.
   */
  loadStats() {
    const receipts = this.sqliteService.getReceipts();
    
    this.totalReceipts = receipts.length;
    
    this.totalBottles = receipts.reduce((total, receipt) => {
      const actualBottles = (receipt.points / 100) / 0.15;
      return total + actualBottles;
    }, 0);
    
    this.totalBottles = Math.round(this.totalBottles);
    this.totalSaved = receipts.reduce((total, receipt) => total + receipt.total_amount, 0);
    
    const storeMap = new Map<string, number>();
    receipts.forEach(receipt => {
      const actualBottles = Math.round((receipt.points / 100) / 0.15);
      const count = storeMap.get(receipt.store_name) || 0;
      storeMap.set(receipt.store_name, count + actualBottles);
    });
    
    this.topStores = Array.from(storeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    this.statCards = [
      {
        title: 'Total Bottles',
        value: this.totalBottles,
        displayValue: 0,
        targetValue: this.totalBottles,
        icon: 'water',
        color: 'primary'
      },
      {
        title: 'Money Saved',
        value: `€${this.totalSaved.toFixed(2)}`,
        displayValue: '€0.00',
        targetValue: this.totalSaved,
        prefix: '€',
        decimals: 2,
        icon: 'cash-outline',
        color: 'success'
      },
      {
        title: 'Receipts',
        value: this.totalReceipts,
        displayValue: 0,
        targetValue: this.totalReceipts,
        icon: 'receipt-outline',
        color: 'tertiary'
      },
      {
        title: 'CO₂ Reduced',
        value: `${(this.totalBottles * 0.08).toFixed(2)}kg`,
        displayValue: '0kg',
        targetValue: this.totalBottles * 0.08,
        suffix: 'kg',
        decimals: 2,
        icon: 'leaf-outline',
        color: 'success'
      }
    ];
    
    this.displayBottles = 0;
    this.displayCO2 = '0';
    this.displayLandfill = '0';
    
    this.animateNumbers();
    this.updateAchievements(receipts);
  }

  /**
   * Animates statistical values with a smooth counting effect.
   * Creates a visual transition from zero to the final values.
   */
  animateNumbers() {
    let currentFrame = 0;
    
    const animationInterval = setInterval(() => {
      currentFrame++;
      const progress = Math.min(currentFrame / this.animationFrames, 1);
      const easedProgress = this.easeOutQuad(progress);
      
      this.statCards.forEach(stat => {
        if (typeof stat.targetValue === 'number') {
          const rawValue = stat.targetValue * easedProgress;
          
          if (stat.decimals) {
            const formattedValue = rawValue.toFixed(stat.decimals);
            stat.displayValue = `${stat.prefix || ''}${formattedValue}${stat.suffix || ''}`;
          } else {
            const formattedValue = Math.round(rawValue);
            stat.displayValue = `${stat.prefix || ''}${formattedValue}${stat.suffix || ''}`;
          }
        }
      });
      
      this.displayBottles = Math.round(this.totalBottles * easedProgress);
      this.displayCO2 = (this.totalBottles * 0.08 * easedProgress).toFixed(2);
      this.displayLandfill = (this.totalBottles * 0.01 * easedProgress).toFixed(2);
      
      if (currentFrame >= this.animationFrames) {
        clearInterval(animationInterval);
        
        this.statCards.forEach(stat => {
          if (typeof stat.targetValue === 'number') {
            if (stat.decimals) {
              stat.displayValue = `${stat.prefix || ''}${stat.targetValue.toFixed(stat.decimals)}${stat.suffix || ''}`;
            } else {
              stat.displayValue = `${stat.prefix || ''}${Math.round(stat.targetValue)}${stat.suffix || ''}`;
            }
          }
        });
        
        this.displayBottles = this.totalBottles;
        this.displayCO2 = (this.totalBottles * 0.08).toFixed(2);
        this.displayLandfill = (this.totalBottles * 0.01).toFixed(2);
      }
    }, this.animationDuration / this.animationFrames);
  }
  
  /**
   * Provides an easing function for smoother, more natural animations.
   * Creates a quadratic ease-out effect.
   * 
   * @param t - The linear animation progress (0 to 1)
   * @returns The eased progress value
   */
  easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  /**
   * Updates achievement completion status based on recycling activity.
   * Checks each achievement criteria against the user's receipt data.
   * 
   * @param receipts - Collection of user's recycling receipts
   */
  updateAchievements(receipts: any[]) {
    this.achievements[0].achieved = receipts.length > 0;
    this.achievements[2].achieved = this.totalBottles >= 100;
    
    const uniqueLocations = new Set(receipts.map(receipt => receipt.location)).size;
    this.achievements[3].achieved = uniqueLocations >= 10;
    this.achievements[1].achieved = false;
  }

  /**
   * Navigates to the leaderboards page.
   */
  goToLeaderboards() {
    this.navCtrl.navigateForward('/leaderboards');
  }

  /**
   * Navigates to the authentication page.
   */
  goToAuth() {
    this.navCtrl.navigateForward('/auth');
  }

  /**
   * Navigates back to the previous page.
   */
  goBack() {
    this.navCtrl.navigateBack('/');
  }

  /**
   * Signs the user out and resets user-specific data.
   * Navigates to the authentication page after logout.
   */
  async logout() {
    try {
      await this.supabaseService.signOut();
      this.resetUserData();
      this.navCtrl.navigateRoot('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Resets all user-specific data to default values.
   * Used when logging out or when user data cannot be retrieved.
   */
  private resetUserData() {
    this.isLoggedIn = false;
    this.userName = '';
    this.userLevel = '';
    this.userLevelNumber = 1;
    this.userPoints = 0;
    this.pointsToNextLevel = 100;
    this.userLevelProgress = 0;
  }
}
