import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { formatDate } from '@angular/common';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { WeekReportRow } from "../../model/week-report-row.model";
import { ApiService } from "../../service/api.service";

@Component({
  selector: 'app-week-report-component',
  templateUrl: './week-report.component.html',
  styleUrls: ['./week-report.component.css']
})
export class WeekReportComponent implements OnInit {
  rows: WeekReportRow[];
  dates: string[];
  maxProjectCount: number = 0;
  maxDurationCount: number = 0;
  selectedDate: Date;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService) {
  }

  ngOnInit(): void {
    console.log('WeekComponent.ngOnInit');
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
    this.route.paramMap.pipe(
      switchMap(params => {
        let dateString = params.get('date');
        if(dateString == null) {
          this.selectedDate = new Date();
          dateString = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');
        }
        else {
          this.selectedDate = parseDateISOString(dateString);
        }
        return this.apiService.getWeekReport(dateString);
      })
    ).subscribe( data => {
      console.log(data);
      this.doReport(data.result);
    });
  }

  doReport(rows): void {
    this.rows = rows;
    this.maxProjectCount = 0;
    this.maxDurationCount = 0;
    for(let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      if(this.maxProjectCount < row.projects.length) {
        this.maxProjectCount = row.projects.length;
      }
      if(this.maxDurationCount < row.durations.length) {
        this.maxDurationCount = row.durations.length;
      }
    }
    this.dates = [];
    for(let d = 0; d < this.maxDurationCount; d++) {
      this.dates.push(this.getDateString(d));
    }
    let prevProjects = [];
    let projCounts = [];
    let projTotals = [];
    for(let p = 0; p < this.maxProjectCount; p++) {
      prevProjects.push('');
      projCounts.push(0);
      let t = [];
      for(let d = 0; d < this.maxDurationCount; d++) {
        t.push(0);
      }
      projTotals.push(t);
    }
    let newRows = [];
    for(let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      for(let p = row.projects.length; p < this.maxProjectCount; p++) {
        row.projects[p] = '';
      }
      for(let d = row.durations.length; d < this.maxProjectCount; d++) {
        row.durations[d] = 0;
      }
      for(let p = row.projects.length - 1; p >= 0; p--) {
        if(prevProjects[p] != row.projects[p]) {
          if(projCounts[p] > 1) {
            let totalRow = {projects: [], durations: [], isTotal: true};
            for(let pp = 0; pp < this.maxProjectCount; pp++) {
              if(pp <= p) {
                totalRow.projects[pp] = prevProjects[pp];
              }
              else {
                totalRow.projects[pp] = '';
              }
            }
            for(let pt = 0; pt < this.maxDurationCount; pt++) {
              totalRow.durations[pt] = projTotals[p][pt];
            }
            newRows.push(totalRow);
          }
          projCounts[p] = 0;
          projTotals[p] = [];
          for(let d = 0; d < this.maxDurationCount; d++) {
            projTotals[p].push(0);
          }
          prevProjects[p] = row.projects[p];
        }
        else {
        }
      }
      for(let p = 0; p < row.projects.length; p++) {
        projCounts[p]++;
        for(let d = 0; d < row.durations.length; d++) {
          projTotals[p][d] += row.durations[d];
        }
      }
      newRows.push(row);
    }
    this.rows = newRows;
    }

  getDateString(delta: number): string {
    let newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    let dateString = formatDate(newDate, 'yyyy-MM-dd', 'en-US');
    return dateString;
  }

   gotoWeek(delta: number): void {
    let date = new Date(this.selectedDate);
    if(delta != null) {
      date.setDate(date.getDate() + delta * 7);
    }
    this.selectedDate = date;
    this.rows = [];
    this.dates = [];
    this.maxProjectCount = 0;
    this.maxDurationCount = 0;
    let dateString = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.apiService.getWeekReport(dateString).subscribe( data => {
      console.log(data);
      this.doReport(data.result);
    });
  }

   gotoDay(delta: number): void {
    let date = new Date(this.selectedDate);
    if(delta != null) {
      date.setDate(date.getDate() + delta);
    }
    let dateString = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.router.navigate(['list-event', { date: dateString }]);
  }
}
