import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';

import { Observable } from "rxjs/index";

import { User } from "../model/user.model";
import { Event } from "../model/event.model";
import { FormEvent } from "../model/form-event.model";
import { Project } from "../model/project.model";
import { ApiResponse } from "../model/api.response";

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) { }
  baseUrl: string = 'http://localhost:9080';

  login(loginPayload) : Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/token/generate-token`, loginPayload);
  }

  getUsers() : Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/users/`);
  }

  getUserById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: User): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/users/`, user);
  }

  updateUser(user: User): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/users/${user.id}`, user);
  }

  deleteUser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${id}`);
  }

  getEvents(date: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/events/${date}`);
  }

  getEvent(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/event/${id}`);
  }

  getWeekReport(date: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/report/week/${date}`);
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
      return this.http.put<ApiResponse>(`${this.baseUrl}/events/`, editEvent);
    }
    let postEvent = {
      datetime: datetime,
      offset: 0,
      comment: event.comment,
      projects: projects
    };
    console.log(postEvent);
    return this.http.post<ApiResponse>(`${this.baseUrl}/events/`, postEvent);
  }

  getRootProjects(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/projects/root`);
  }

  getProjects(parentId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/projects/${parentId}`)
  }

  deleteEvent(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/event/${id}`);
  }

  dupEvent(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/dup/${id}`);
  }

  createProject(project: Project): Observable<ApiResponse> {
    console.log("createProject");
    console.log(project);
    return this.http.post<ApiResponse>(`${this.baseUrl}/projects/`, project);
  }
}
