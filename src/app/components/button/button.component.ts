import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button [class]="getButtonClasses()" [type]="type">
      @if (icon) {
      <lucide-icon [img]="icon" class="h-4 w-4 mr-2"></lucide-icon>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'danger' | 'secondary' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() classname?: string;
  @Input() icon?: any;

  getButtonClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md px-3 w-24 h-10 text-sm font-semibold';

    const variantClasses = {
      primary: 'bg-primary hover:bg-green-600 text-primary-foreground',
      danger: 'bg-red-600 hover:bg-red-700 text-destructive-foreground',
      secondary: 'bg-gray-900 hover:bg-gray-800 text-primary-foreground',
    };

    return `${this.classname ?? baseClasses} ${variantClasses[this.variant]}`;
  }
}
