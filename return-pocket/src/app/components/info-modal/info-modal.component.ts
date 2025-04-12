import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

/**
 * InfoModalComponent
 * 
 * A modal component styled as a receipt that provides instructions on how to use
 * the Return Pocket application. Features animated step numbers and fade transitions.
 */
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
  /** Emits when the modal should be closed */
  @Output() close = new EventEmitter<void>();
  
  /** Current date for display in receipt header */
  currentDate: Date = new Date();
  
  /** Controls the animation state of the modal */
  animationState: string = 'visible';

  /**
   * @param cdr Change detector reference for triggering detection cycles
   */
  constructor(private cdr: ChangeDetectorRef) { }

  /**
   * Initialize the component and set up animations
   * - Forces change detection to ensure text renders properly
   * - Creates staggered animation effects for step numbers
   */
  ngOnInit() {
    // Force initial change detection to ensure content renders
    this.cdr.detectChanges();
    
    // Animate step numbers with staggered timing for visual interest
    setTimeout(() => {
      const steps = document.querySelectorAll('.step-number');
      steps.forEach((step, index) => {
        setTimeout(() => {
          (step as HTMLElement).style.animation = 'pulse 1s 2';
        }, index * 1000);
      });
    }, 500);
    
    // Ensure all content is properly rendered after animations
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Handles the modal close action with exit animation
   * - Changes animation state to trigger fade-out
   * - Emits close event after animation completes
   */
  closeModal() {
    this.animationState = 'void';
    setTimeout(() => {
      this.close.emit();
    }, 200);
  }
}
