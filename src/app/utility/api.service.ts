import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient
  ) { }

  getTopHundredQoutes(page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/getTopHundredQoutes?page=${page}`
    );
  }

  getAuthors(): Observable<any[]> {
    return this.http.get<any[]>(environment.SERVICE_URL + 'api/qoutes/getAuthors');
  }

  getTopics(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getTopics');
  }

  getTopicsNew() {
    return this.http.get<any[]>(environment.SERVICE_URL + 'api/qoutes/getTopicsNew');
  }

  getQoutesByAuthorID(authorID: any, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/getQoutesByAuthorID?authorID=${authorID}&page=${page}`
    );
  }

  getQoutesByTopicID(topicID: any, page: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.SERVICE_URL}api/qoutes/getQoutesByTopicID?topicID=${topicID}&page=${page}`
    );
  }

  searchGlobalInQoutes(searchedKeyword: string, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/searchGlobalInQoutes?searchedKeyword=${searchedKeyword}&page=${page}`
    );
  }

  updateStatsCount(): Observable<JSON> {
    let obj = {
      "id": "000",
      "des": "resp"
    }
    return this.http.post<JSON>(environment.SERVICE_URL + 'api/qoutes/saveStats', { obj });
  }

  saveQoutes(jsonObj: any): Observable<JSON> {
    return this.http.post<JSON>(environment.SERVICE_URL + 'api/qoutes/saveQoutes', jsonObj);
  }

  getStats(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getStats');
  }
}
