import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { formatDate } from '@angular/common';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ApiService } from "../../service/api.service";

class WeekReportProject {
  id: number;
  code: string;
}
class WeekReportRow {
  projects: WeekReportProject[];
  durations: number[];
  highlighted: boolean[];
}

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
      alert('Not logged in');
      this.router.navigate(['list-event']);
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
      if(data.status === 401) {
        alert('Unauthorized');
        this.router.navigate(['list-event']);
        return;
      }
      this.doReport(data.result);
    });
  }

  doReport(rows): void {
    this.maxProjectCount = 0;
    this.maxDurationCount = 0;
    for(let i = 0; i < rows.length; i++) {
      let row = rows[i];
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
      prevProjects.push({id: 0, code: ''});
      projCounts.push(0);
      let t = [];
      for(let d = 0; d < this.maxDurationCount; d++) {
        t.push(0);
      }
      projTotals.push(t);
    }
    let newRows = [];
    for(let i = 0; i < rows.length; i++) {
      let row = rows[i];
      for(let p = row.projects.length; p < this.maxProjectCount; p++) {
        row.projects[p] = {id: 0, code: ''};
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
                totalRow.projects[pp] = {id: 0, code: ''};
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
    console.log(this.rows);
    for(let row of this.rows) {
      let project = this.getLeafProject(row);
      console.log(project);
      if(!row.highlighted) {
        row.highlighted = [];
      }
      for(let d = 0; d < this.dates.length; d++) {
        let date = this.dates[d];
        console.log(d, date)
        this.apiService.getWeekReportCell(project.id, date).subscribe( data => {
          console.log('getWeekReportCell data', data);
          row.highlighted[d] = data.result.checked;
        });
      }
    }
  }

  getDate(delta: number): Date {
    let newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    return newDate; 
  }

  getDateString(delta: number): string {
    let newDate = this.getDate(delta);
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

  isToday(date: string): boolean {
    return date == formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  clickCell(r: number, d: number): void {
    let row = this.rows[r];
    if(!row.highlighted) {
      row.highlighted = [];
    }
    row.highlighted[d] = !row.highlighted[d];
    let checked = row.highlighted[d];
    console.log('clickCell', row);
    let project = this.getLeafProject(row);
    if(project != null) {
      let duration = row.durations[d];
      let date = this.getDateString(d);
      this.apiService.saveWeekReportCell(project.id, date, duration, checked).subscribe( data => {
        console.log(data);
      });
    }
    else {
      console.log("project was null");
    }
  }

  getLeafProject(row) {
    let i = row.projects.length;
    let project = null;
    while(i > 0) {
      project = row.projects[i - 1];
      if(project.id != 0) {
        break;
      }
      i--;
    }
    return project;
  }

  isHighlighted(r: number, d: number): boolean {
    let row = this.rows[r];
    return row.highlighted && row.highlighted.length > d && row.highlighted[d];
  }
}
