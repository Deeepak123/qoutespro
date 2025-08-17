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

const httpOptionsWithAuthToken = {
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
      httpOptionsWithAuthToken
    );
  }

  getAuthors(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getAuthors', httpOptionsWithAuthToken);
  }

  getTopics(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getTopics', httpOptionsWithAuthToken);
  }

  // getQoutesByAuthorID(authorID: any): Observable<JSON> {
  //   //let param = new HttpParams().set("authorID", authorID);
  //   return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getQoutesByAuthorID?authorID=' + authorID, httpOptionsWithAuthToken);
  // }

  getQoutesByAuthorID(authorID: any, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/getQoutesByAuthorID?authorID=${authorID}&page=${page}`,
      httpOptionsWithAuthToken
    );
  }

  // getQoutesByTopicID(topicID: any): Observable<JSON> {
  //   let param = new HttpParams().set("topicID", topicID);
  //   return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getQoutesByTopicID?topicID=' + topicID, httpOptionsWithAuthToken);
  // }

  getQoutesByTopicID(topicID: any, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/getQoutesByTopicID?topicID=${topicID}&page=${page}`,
      httpOptionsWithAuthToken
    );
  }

  // searchGlobalInQoutes(searchedKeyword: string): Observable<JSON> {
  //   let param = new HttpParams().set("searchedKeyword", searchedKeyword);
  //   return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/searchGlobalInQoutes?searchedKeyword=' + searchedKeyword, httpOptionsWithAuthToken);
  // }

  searchGlobalInQoutes(searchedKeyword: string, page: number): Observable<JSON> {
    return this.http.get<JSON>(
      `${environment.SERVICE_URL}api/qoutes/searchGlobalInQoutes?searchedKeyword=${searchedKeyword}&page=${page}`,
      httpOptionsWithAuthToken
    );
  }

  updateStatsCount(): Observable<JSON> {
    let obj = {
      "id": "000",
      "des": "resp"
    }
    return this.http.post<JSON>(environment.SERVICE_URL + 'api/qoutes/saveStats', { obj }, httpOptionsWithAuthToken);
  }

  saveQoutes(jsonObj: any): Observable<JSON> {
    return this.http.post<JSON>(environment.SERVICE_URL + 'api/qoutes/saveQoutes', jsonObj, httpOptionsWithAuthToken);
  }

  // saveStatsR(jsonObj: any[]): Observable<any> {
  //   return this.http.post<any>(environment.SERVICE_URL + 'api/qoutes/saveStatsR', jsonObj, httpOptionsWithAuthToken);
  // }

  getStats(): Observable<JSON> {
    return this.http.get<JSON>(environment.SERVICE_URL + 'api/qoutes/getStats', httpOptionsWithAuthToken);
  }
}
