import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';

interface StatCard {
  title: string;
  value: string | number;
  displayValue: string | number; // For animated counting
  targetValue: number; // The final value to animate to
  icon: string;
  color: string;
  prefix?: string; // For currency symbols or units
  suffix?: string; // For units
  decimals?: number; // For decimal precision
}

interface Achievement {
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class StatsPage implements OnInit {
  userName = 'John Doe';
  userLevel = 'Recycling Champion';
  userProfileImage = 'assets/avatar-placeholder.png';
  totalBottles = 0;
  totalSaved = 0;
  totalReceipts = 0;
  topStores: {name: string, count: number}[] = [];
  statCards: StatCard[] = [];
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

  // Animation properties
  animationDuration = 1500; // ms
  animationFrames = 20;
  
  // Environmental impact display values
  displayBottles = 0;
  displayCO2 = '0';
  displayLandfill = '0';

  constructor(
    private sqliteService: SqliteService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  ionViewWillEnter() {
    this.loadStats();
  }

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
    
    // Create stat cards with animation values
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
    
    // Reset display values for environmental impact
    this.displayBottles = 0;
    this.displayCO2 = '0';
    this.displayLandfill = '0';
    
    // Trigger animations
    this.animateNumbers();
    
    this.updateAchievements(receipts);
  }

  // Animation function for counting effects
  animateNumbers() {
    // Animate stat cards
    let currentFrame = 0;
    
    const animationInterval = setInterval(() => {
      currentFrame++;
      const progress = Math.min(currentFrame / this.animationFrames, 1);
      const easedProgress = this.easeOutQuad(progress);
      
      // Update each stat card
      this.statCards.forEach(stat => {
        if (typeof stat.targetValue === 'number') {
          const rawValue = stat.targetValue * easedProgress;
          
          if (stat.decimals) {
            // Format with decimal places
            const formattedValue = rawValue.toFixed(stat.decimals);
            stat.displayValue = `${stat.prefix || ''}${formattedValue}${stat.suffix || ''}`;
          } else {
            // Format as integer
            const formattedValue = Math.round(rawValue);
            stat.displayValue = `${stat.prefix || ''}${formattedValue}${stat.suffix || ''}`;
          }
        }
      });
      
      // Update environmental impact values
      this.displayBottles = Math.round(this.totalBottles * easedProgress);
      this.displayCO2 = (this.totalBottles * 0.08 * easedProgress).toFixed(2);
      this.displayLandfill = (this.totalBottles * 0.01 * easedProgress).toFixed(2);
      
      if (currentFrame >= this.animationFrames) {
        clearInterval(animationInterval);
        
        // Ensure we end up with exact target values
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
  
  // Easing function for smoother animation
  easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  updateAchievements(receipts: any[]) {
    this.achievements[0].achieved = receipts.length > 0;
    this.achievements[2].achieved = this.totalBottles >= 100;
    
    const uniqueLocations = new Set(receipts.map(receipt => receipt.location)).size;
    this.achievements[3].achieved = uniqueLocations >= 10;
    this.achievements[1].achieved = false;
  }

  goBack() {
    this.navCtrl.navigateBack('/');
  }
}
