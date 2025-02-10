import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
  <main class="bg-gradient-to-b from-gray-900 to-black text-white">
    <router-outlet></router-outlet>
  </main>`,
})
export class AppComponent {
  title = 'spotitrack'
}
