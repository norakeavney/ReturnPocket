import { Component, Input } from '@angular/core';
// Add Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, MatToolbarModule]
})
export class HeaderComponent {
  @Input() mainText: string | null = null;
  @Input() subText?: string | null = null;
  @Input() imgSrc?: string | null = null;
  @Input() customStyles?: any = {};

  constructor() { }
}
