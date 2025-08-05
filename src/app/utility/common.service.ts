import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    private subscription: Subscription = new Subscription();

    constructor(
        private apiSer: ApiService,
    ) { }

    updateStatsCount = () => {
        const updateStatsCount$ = this.apiSer.updateStatsCount().subscribe((val: any) => {
        }, (error: any) => {
            console.log("ERROR:" + error);
        })
        this.subscription.add(updateStatsCount$);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
