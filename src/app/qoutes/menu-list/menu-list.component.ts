import { Component, Input, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss']
})
export class MenuListComponent implements OnInit {

  @Input('drawer') drawer: MatDrawer = null as any;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  closeToggle() {
    this.drawer.toggle();
  }

  routTo = (routeValue: string) => {
    this.drawer.toggle();
    this.router.navigate([routeValue]);
  }
}
