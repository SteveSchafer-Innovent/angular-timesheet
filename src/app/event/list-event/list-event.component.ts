import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { formatDate } from '@angular/common';

import { Observable, of } from 'rxjs';
import { switchMap, catchError, retry } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ReportEvent } from "../../model/report-event.model";
import { ApiService } from "../../service/api.service";
import { Event } from "../../model/event.model";
import { FormEvent } from "../../model/form-event.model";

@Component({
  selector: 'app-list-event',
  templateUrl: './list-event.component.html',
  styleUrls: ['./list-event.component.css']
})
export class ListEventComponent implements OnInit {
  reportEvents: ReportEvent[];
  selectedDate: Date;
  isToday: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService) {
  }

  ngOnInit() {
    console.log('ListEventComponent.ngOnInit');
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
    function parseDateISOString(s: string): Date {
      let ds = s.split(/\D+/).map(s => parseInt(s));
      ds[1] = ds[1] - 1; // adjust month
      return new Date(ds[0], ds[1], ds[2]);
    }
    let component = this;
    let observable = component.route.paramMap.pipe(
      switchMap(params => {
        let dateString = params.get('date');
        if(dateString == null) {
          component.selectedDate = new Date();
          component.isToday = true;
          dateString = formatDate(component.selectedDate, 'yyyy-MM-dd', 'en-US');
        }
        else {
          component.selectedDate = parseDateISOString(dateString);
          console.log(component.selectedDate);
          component.isToday = component.selectedDate.getDate() == new Date().getDate();
        }
        return of(dateString);
      })
    );
    observable.subscribe(dateString => {
      console.log("dateString:");
      console.log(dateString);
      function loadPage(): void {
        let observable = component.apiService.getEvents(dateString);
        observable.subscribe( data => {
          if(data.status === 401) {
            console.log('removing token');
            window.localStorage.removeItem('token');
            let dateString = formatDate(component.selectedDate, 'yyyy-MM-dd', 'en-US');
            component.router.navigate(['list-event', { date: dateString }]);
          }
          else {
            console.log("data:");
            console.log(data);
            component.reportEvents = data.result;
          }
        });
      }
      if(environment.username != null) {
        if(!window.localStorage.getItem('token')) {
          console.log(environment.username);
          const loginPayload = {
            username: environment.username,
            password: environment.password
          }
          this.apiService.login(loginPayload).subscribe(data => {
            if(data.status === 200) {
              window.localStorage.setItem('token', data.result.token);
              loadPage();
            }
            else {
              alert(data.message);
            }
          });
        }
        else {
          loadPage();
        }
      }
      else {
        if(!window.localStorage.getItem('token')) {
          alert("token not found");
          this.router.navigate(['login']);
        }
        else {
          loadPage();
        }
      }
    });
  }

  deleteEvent(event: Event): void {
    this.apiService.deleteEvent(event.id)
      .subscribe( data => {
        console.log(data.result);
        this.reportEvents = this.reportEvents.filter(reportEvent => reportEvent.id !== event.id);
      });
  }

  editEvent(event: Event): void {
    this.router.navigate(['edit-event', { eventId: event.id }]);
  }

  dupEvent(event: Event): void {
    this.apiService.dupEvent(event.id)
      .subscribe( data => {
        this.gotoDay(null);
      });
  }

  addEvent(): void {
    this.router.navigate(['edit-event', { eventId: 0 }]);
  }

  getDateString(delta: number): string {
    console.log('getDateString ' + this.selectedDate + " + " + delta);
    if(typeof this.selectedDate == 'undefined') {
      return '';
    }
    try {
      let newDate = new Date(this.selectedDate);
      newDate.setDate(newDate.getDate() + delta);
      let dateString = formatDate(newDate, 'yyyy-MM-dd', 'en-US');
      return dateString;
    }
    catch(e) {
      debugger
    }
  }

   gotoDay(delta: number): void {
    if(delta == null) {
      this.selectedDate = new Date();
      this.isToday = true;
    }
    else {
      this.selectedDate.setDate(this.selectedDate.getDate() + delta);
      this.isToday = this.selectedDate.getDate() == new Date().getDate();
    }
    let dateString = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');
    let observable = this.apiService.getEvents(dateString)
    observable.subscribe( data => {
      if(data.status === 401) {
        this.router.navigate(['login']);
      }
      this.reportEvents = data.result;
    });
  }

  week(): void {
    let date = new Date(this.selectedDate);
    date.setDate(date.getDate() - date.getDay());
    this.router.navigate(['report-week', {date: formatDate(date, 'yyyy-MM-dd', 'en-US')}]);
  }

  projects(): void {
    this.router.navigate(['list-project']);
  }

  personal(): void {
    let date = new Date();
    let dateString = formatDate(date, 'yyyy-MM-dd', 'en-US');
    let timeString = formatDate(date, 'HH:mm:ss', 'en-US');
    let formEvent: FormEvent = {id: null, date: dateString, time: timeString, comment: "", projects: [[3]]};
    this.apiService.saveEvent(formEvent)
      .subscribe( data => {
        this.gotoDay(null);
      });
  }

  logout(): void {
    this.router.navigate(['login']);
  }
}
