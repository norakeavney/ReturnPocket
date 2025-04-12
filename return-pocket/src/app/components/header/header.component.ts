import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

/**
 * Header component that displays a configurable page header with optional image,
 * main text, and subtext elements.
 * 
 * This standalone component provides a consistent header layout across the application
 * and can be styled with custom properties as needed.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, MatToolbarModule]
})
export class HeaderComponent {
  /** Primary heading text displayed in the header */
  @Input() mainText: string | null = null;
  
  /** Optional secondary text displayed below the main heading */
  @Input() subText?: string | null = null;
  
  /** Optional image source URL for the header logo */
  @Input() imgSrc?: string | null = null;
  
  /** Optional custom styles object to apply additional styling to the component */
  @Input() customStyles?: any = {};
}
