import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule]
})
export class HeaderComponent{

  @Input() mainText: string | null = null;
  @Input() subText?: string | null = null;
  @Input() imgSrc?: string | null = null;
  @Input() customStyles?: any = {};

  constructor() { }

}
