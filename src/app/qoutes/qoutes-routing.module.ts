import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentLayerComponent } from './parent-layer/parent-layer.component';
import { AuthorsComponent } from './authors/authors.component';
import { TopicsComponent } from './topics/topics.component';
import { AuthorQoutesComponent } from './author-qoutes/author-qoutes.component';
import { TopicQoutesComponent } from './topic-qoutes/topic-qoutes.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { HomeComponent } from './home/home.component';
import { StatsComponent } from './stats/stats.component';

const routes: Routes = [
  {
    path: '', component: ParentLayerComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'authors', component: AuthorsComponent },
      { path: 'author/:authorId/:authorName', component: AuthorQoutesComponent },
      { path: 'topics', component: TopicsComponent },
      { path: 'topic/:topicId/:topicName', component: TopicQoutesComponent },
      { path: 'search-results', component: SearchResultsComponent },
      { path: 'sQ', component: StatsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class QoutesRoutingModule { }
