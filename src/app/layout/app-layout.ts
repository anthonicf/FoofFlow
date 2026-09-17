import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, Topbar, MobileNav],
  template: `
    <div class="app-shell">
      <app-sidebar class="app-sidebar" />
      <div class="app-main">
        <app-topbar class="app-topbar" />
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-mobile-nav />
  `,
})
export class AppLayout {}