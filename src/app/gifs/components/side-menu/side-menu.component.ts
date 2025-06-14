import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SideMenuHeaderComponent } from "./side-menu-header/side-menu-header.component";
import { GifsSideMenuOptionsComponent } from "./side-menu-options/side-menu-options.component";

@Component({
  selector: 'gifs-side-menu',
  imports: [SideMenuHeaderComponent, GifsSideMenuOptionsComponent],
  templateUrl: './side-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent { }
