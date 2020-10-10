import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { formatDate } from '@angular/common';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    if(!window.localStorage.getItem('token')) {
      this.router.navigate(['login']);
      return;
    }
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
    function parseDateISOString(s: string): Date {
      let ds = s.split(/\D+/).map(s => parseInt(s));
      ds[1] = ds[1] - 1; // adjust month
      return new Date(ds[0], ds[1], ds[2]);
    }
    let observable = this.route.paramMap.pipe(
      switchMap(params => {
        let dateString = params.get('date');
        if(dateString == null) {
          this.selectedDate = new Date();
          this.isToday = true;
          dateString = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');
        }
        else {
          this.selectedDate = parseDateISOString(dateString);
          console.log(this.selectedDate);
          this.isToday = this.selectedDate.getDate() == new Date().getDate();
        }
        return this.apiService.getEvents(dateString);
      })
    );
    observable.subscribe( data => {
      console.log(data.result);
      this.reportEvents = data.result;
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
    let newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    let dateString = formatDate(newDate, 'yyyy-MM-dd', 'en-US');
    return dateString;
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
      this.reportEvents = data.result;
    });
  }

  week(): void {
    let date = new Date(this.selectedDate);
    date.setDate(date.getDate() - date.getDay());
    this.router.navigate(['report-week', {date: formatDate(date, 'yyyy-MM-dd', 'en-US')}]);
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
}
