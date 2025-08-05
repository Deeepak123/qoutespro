// import { Injectable } from '@angular/core';
// import { Subject, Observable } from 'rxjs';

// @Injectable({
//     providedIn: 'root'
// })
// export class FireEventService {

//     protected _eventSubject = new Subject();
//     public events = this._eventSubject.asObservable();

//     constructor() { }

//     getFireEvent(): Observable<any> {
//         return this._eventSubject.asObservable();
//     }

//     fireEventSearchResults = (reqFrom: any) => {
//         this._eventSubject.next({ reqFromRefresh: reqFrom });
//     }
// }
