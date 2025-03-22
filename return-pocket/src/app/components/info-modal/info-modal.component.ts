import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeIn', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('200ms ease-in'))
    ])
  ]
})
export class InfoModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  currentDate: Date = new Date();
  animationState: string = 'visible';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Force change detection to ensure text renders
    this.cdr.detectChanges();
    
    // Auto-animate steps with a slight delay
    setTimeout(() => {
      const steps = document.querySelectorAll('.step-number');
      steps.forEach((step, index) => {
        setTimeout(() => {
          (step as HTMLElement).style.animation = 'pulse 1s 2';
        }, index * 1000);
      });
    }, 500);
    
    // Force another change detection after delay
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  closeModal() {
    this.animationState = 'void';
    setTimeout(() => {
      this.close.emit();
    }, 200);
  }
}
