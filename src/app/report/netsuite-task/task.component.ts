import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { formatDate } from '@angular/common';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ApiService } from "../../service/api.service";

class ReportRow {
  client: string;
  project: string;
  task: string;
  hours: number;
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  rows: ReportRow[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService) {
  }

  ngOnInit(): void {
    console.log('TaskComponent.ngOnInit');
    if(!window.localStorage.getItem('token')) {
      alert('Not logged in');
      this.router.navigate(['list-event']);
      return;
    }
    this.route.paramMap.pipe(
      switchMap(params => {
        return this.apiService.getNetsuiteTaskReport();
      })
    ).subscribe( data => {
      console.log(data);
      if(data.status === 401) {
        alert('Unauthorized');
        this.router.navigate(['list-event']);
        return;
      }
      this.rows = data.result;
    });
  }

}
