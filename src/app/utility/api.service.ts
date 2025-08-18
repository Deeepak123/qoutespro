import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'false',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient
  ) { }

  getTopHundredQoutes(page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/getTopHundredQoutes?page=${page}`,
      httpOptions
    );
  }

  getAuthors(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getAuthors', httpOptions);
  }

  getTopics(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getTopics', httpOptions);
  }

  getQoutesByAuthorID(authorID: any, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/getQoutesByAuthorID?authorID=${authorID}&page=${page}`,
      httpOptions
    );
  }

  getQoutesByTopicID(topicID: any, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/getQoutesByTopicID?topicID=${topicID}&page=${page}`,
      httpOptions
    );
  }

  searchGlobalInQoutes(searchedKeyword: string, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/searchGlobalInQoutes?searchedKeyword=${searchedKeyword}&page=${page}`,
      httpOptions
    );
  }

  updateStatsCount(): Observable<JSON> {
    let obj = {
      "id": "000",
      "des": "resp"
    }
    return this.http.post<JSON>(environment.SERVICE_URL + 'api/qoutes/saveStats', { obj }, httpOptions);
  }

  saveQoutes(jsonObj: any): Observable<JSON> {
    return this.http.post<JSON>(environment.SERVICE_URL + 'api/qoutes/saveQoutes', jsonObj, httpOptions);
  }

  getStats(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getStats', httpOptions);
  }
}
