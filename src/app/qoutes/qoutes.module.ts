import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QoutesRoutingModule } from './qoutes-routing.module';
import { ParentLayerComponent } from './parent-layer/parent-layer.component';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MenuListComponent } from './menu-list/menu-list.component';
import { AuthorsComponent } from './authors/authors.component';
import { TopicsComponent } from './topics/topics.component';
import { AuthorQoutesComponent } from './author-qoutes/author-qoutes.component';
import { TopicQoutesComponent } from './topic-qoutes/topic-qoutes.component';
import { SearchFilter } from '../utility/search-filter';
import { SearchResultsComponent } from './search-results/search-results.component';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './footer/footer.component';
import { Top100Component } from './top100/top100.component';
import { HomeComponent } from './home/home.component';
import { StatsComponent } from './stats/stats.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { TermsComponent } from './terms/terms.component';
@NgModule({
  declarations: [
    ParentLayerComponent,
    MenuListComponent,
    AuthorsComponent,
    TopicsComponent,
    AuthorQoutesComponent,
    TopicQoutesComponent,
    SearchFilter,
    SearchResultsComponent,
    FooterComponent,
    HomeComponent,
    Top100Component,
    StatsComponent,
    PrivacyComponent,
    ContactComponent,
    AboutComponent,
    TermsComponent,
  ],
  imports: [
    CommonModule,
    QoutesRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    MatIconModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [MenuListComponent]
})
export class QoutesModule { }
