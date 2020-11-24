import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';

import { Observable } from "rxjs/index";
import { catchError, retry } from 'rxjs/operators';
import { throwError, concat, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from "../model/user.model";
import { Event } from "../model/event.model";
import { FormEvent } from "../model/form-event.model";
import { Project } from "../model/project.model";
import { ApiResponse } from "../model/api.response";

@Injectable()
export class ApiService {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = `http://localhost:${environment.port}`;
    console.log(`ApiService.baseUrl = ${this.baseUrl}`);
  }

  login(loginPayload) : Observable<ApiResponse> {
    console.log(loginPayload);
    return this.http.post<ApiResponse>(`${this.baseUrl}/token/generate-token`, loginPayload);
  }

  private handleError(val: ApiResponse): void {
    console.log('caught error, val:');
    console.log(val);
    if(val.status === 401) {
      console.log('removing token');
      window.localStorage.removeItem('token');
    }
  }

  getUsers() : Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/users/`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getUserById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/users/${id}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  createUser(user: User): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/users/`, user).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  updateUser(user: User): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/users/${user.id}`, user).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  deleteUser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${id}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getEvents(date: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/events/${date}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getEvent(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/event/${id}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getWeekReport(date: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/report/week/${date}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  saveWeekReportCell(projectId: number, date: string, time: number, checked: boolean): Observable<ApiResponse> {
    console.log('saveWeekReportCell', projectId, date, time, checked);
    let request = {userId: 0, projectId: projectId, date: date, time: time, checked: checked};
    return this.http.post<ApiResponse>(`${this.baseUrl}/report/check`, request).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getWeekReportCell(projectId: number, date: string): Observable<ApiResponse> {
    console.log('getWeekReportCell', projectId, date);
    return this.http.get<ApiResponse>(`${this.baseUrl}/report/check/${projectId}/${date}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  saveEvent(event: FormEvent): Observable<ApiResponse> {
    console.log("saveEvent");
    console.log(event);
    let id = event.id;
    let dateString = typeof event.date == "string" ? event.date : formatDate(event.date, 'yyyy-MM-dd', 'en-US');
    let datetime = new Date(dateString + "T" + event.time);
    console.log(datetime);
    let projects = [];
    for(let alt = 0; alt < event.projects.length; alt++) {
      let levels = event.projects[alt];
      let lastIndex = levels.length - 1;
      let lastProjectId = levels[lastIndex];
      while(lastIndex > 0 && lastProjectId == 0) {
        lastIndex--;
        lastProjectId = levels[lastIndex];
      }
      if(lastProjectId != 0) {
        projects.push(lastProjectId);
      }
    }
    if(+id > 0) {
      let editEvent = {
        id: id,
        datetime: datetime,
        offset: 0,
        comment: event.comment,
        projects: projects
      };
      console.log(editEvent);
      return this.http.put<ApiResponse>(`${this.baseUrl}/events/`, editEvent).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
    }
    let postEvent = {
      datetime: datetime,
      offset: 0,
      comment: event.comment,
      projects: projects
    };
    console.log(postEvent);
    return this.http.post<ApiResponse>(`${this.baseUrl}/events/`, postEvent).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  deleteEvent(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/event/${id}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  dupEvent(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/dup/${id}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getRootProjects(): Observable<ApiResponse> {
    console.log(`apiService getRootProjects`);
    return this.http.get<ApiResponse>(`${this.baseUrl}/projects/root`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getProjects(parentId: number): Observable<ApiResponse> {
    console.log(`apiService getProjects ${parentId}`);
    return this.http.get<ApiResponse>(`${this.baseUrl}/projects/${parentId}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  getProject(id: number): Observable<ApiResponse> {
    console.log(`apiService getProject ${id}`);
    return this.http.get<ApiResponse>(`${this.baseUrl}/project/${id}`).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  createProject(project: Project): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/projects/`, project).pipe(
      catchError(val => {
        this.handleError(val);
        return of(val);
      })
    );
  }

  addProject(parentId: number, code: string): Observable<ApiResponse> {
    let project = {id: null, parentId: parentId, code: code};
    return this.http.post<ApiResponse>(`${this.baseUrl}/projects`, project).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  addRootProject(code: string): Observable<ApiResponse> {
    let project = {id: null, parentId: null, code: code};
    return this.http.post<ApiResponse>(`${this.baseUrl}/projects`, project).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  editProject(id: number, parentId: number, code: string): Observable<ApiResponse> {
    let project = {id: id, parentId: parentId, code: code};
    return this.http.put<ApiResponse>(`${this.baseUrl}/projects`, project).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  editRootProject(id: number, code: string): Observable<ApiResponse> {
    let project = {id: id, parentId: null, code: code};
    return this.http.put<ApiResponse>(`${this.baseUrl}/projects`, project).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  getProjectAncestry(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/project/ancestry/${id}`).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  deleteProject(id: number): Observable<ApiResponse> {
    console.log(`apiService deleteProject ${id}`);
    let response = this.http.delete<ApiResponse>(`${this.baseUrl}/project/${id}`).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
    console.log(response);
    return response;
  }

  canDeleteProject(id: number): Observable<ApiResponse> {
    console.log(`apiService canDeleteProject ${id}`);
    let response = this.http.get<ApiResponse>(`${this.baseUrl}/project/canDelete/${id}`).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
    return response;
  }

  postFile(fileToUpload: File): Observable<ApiResponse> {
      console.log("postFile");
      console.log(fileToUpload);
      const formData: FormData = new FormData();
      formData.set('file', fileToUpload, fileToUpload.name);
      formData.set('someProperty', "value");
      return this.http.post<ApiResponse>(`${this.baseUrl}/upload`, formData).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  getUploadReport(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/uploads`).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  getUploadDetailReport(uploadId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/upload-detail/${uploadId}`).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }

  getNetsuiteTaskReport(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/netsuite-task-report`).pipe(
      catchError(val => {
        console.log('val:', val);
        return of(val);
      })
    );
  }
}
