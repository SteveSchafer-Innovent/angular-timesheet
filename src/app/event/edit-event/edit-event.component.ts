import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { MatSelectModule } from '@angular/material/select';
import { formatDate, Location } from '@angular/common';

import { ApiService } from "../../service/api.service";
import { Project } from '../../model/project.model';
import { FormEvent } from '../../model/form-event.model';
import { ApiResponse } from '../../model/api.response';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css']
})
export class EditEventComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private apiService: ApiService
  ) { }

  editForm: FormGroup;
  idControl: FormControl;
  dateControl: FormControl;
  timeControl: FormControl;
  projectAltLevelArray: FormArray;
  commentControl: FormControl;
  projectSelectionLists: Project[][][];
  title: string;

  ngOnInit() {
    if(!window.localStorage.getItem('token')) {
      alert('Not logged in');
      this.router.navigate(['list-event']);
      return;
    }
    this.title = '';
    this.idControl = new FormControl('');
    this.dateControl = new FormControl(new Date(), Validators.required);
    this.timeControl = new FormControl('', Validators.required);
    this.projectAltLevelArray = new FormArray([]);
    this.commentControl = new FormControl('');
    this.editForm = new FormGroup({
      id: this.idControl,
      date: this.dateControl,
      time: this.timeControl,
      projects: this.projectAltLevelArray,
      comment: this.commentControl
    });
    this.projectSelectionLists = [[[{ id: 0, parentId: null, code: 'Loading...' }]]];
    this.route.paramMap.subscribe((params: ParamMap) => {
      let eventId = +params.get('eventId');
      console.log(`param eventId = ${eventId}`);
      if(eventId == 0) {
        this.title = `Add Event`;
        let datetime = new Date();
        this.dateControl.setValue(datetime);
        let timeString = formatDate(datetime, 'HH:mm:ss', 'en-US');
        this.timeControl.setValue(timeString);
        this.apiService.getRootProjects().subscribe( data => {
          this.populateProjectSelectionsLists(0, 0, data, null);
        });
      }
      else {
        this.apiService.getEvent(eventId).subscribe(apiResponse => {
          let event = apiResponse.result;
          console.log(event);
          this.title = `Edit Event ${event.id}`;
          this.idControl.setValue(event.id);
          let datetime = new Date(event.datetime);
          this.dateControl.setValue(datetime);
          let timeString = formatDate(datetime, 'HH:mm:ss', 'en-US');
          this.timeControl.setValue(timeString);
          this.commentControl = new FormControl(event.comment);
          this.apiService.getRootProjects().subscribe( data => {
            this.populateProjectSelectionsLists(0, 0, data, event.projects);
          });
        });
      }
    });
  }

  addProjectAlt: number = -1;
  addProjectLevel: number = -1;
  addProjectParentId: number = -1;

  populateProjectSelectionsLists(alt: number, level: number, data: ApiResponse, selectedProjects: number[][]): void {
    console.log(`populateProjectSelectionsLists alt = ${alt}, level = ${level}`);
    console.log(data);
    console.log(selectedProjects);
    this.projectSelectionLists[alt][level] = [
      { id: 0, parentId: null, code: 'Select project...' },
      { id: -1, parentId: null, code: 'Add project...' }
    ];
    for(let i = 0; i < data.result.length; i++) {
      let dataResult = data.result[i];
      let project = { id: dataResult.id, parentId: null, code: dataResult.code };
      console.log(project);
      this.projectSelectionLists[alt][level].push(project);
    }
    // populate controls
    let altArray: FormArray = this.projectAltLevelArray;
    while(altArray.length <= alt) {
      altArray.insert(alt, new FormArray([]));
    }
    let levelArray = altArray.at(alt) as FormArray;
    levelArray.insert(level, new FormControl(0, Validators.required));
    console.log("init level " + level);
    let component = this;
    let projectControl = levelArray.at(level) as FormControl;
    let selectedProjectId = 0;
    if(selectedProjects != null && selectedProjects.length > alt && selectedProjects[alt].length > level) {
        selectedProjectId = selectedProjects[alt][level];
    }
    projectControl.valueChanges.subscribe(projectId => {
      console.log(`alt ${alt}, level ${level}: on change projectId = ${projectId}`);
      for(let l = levelArray.length - 1; l > level; l--) {
        levelArray.removeAt(l);
      }
      if(level == 0) {
        for(let a = altArray.length - 1; a > alt; a--) {
          altArray.removeAt(a);
        }
      }
      if(projectId == 0) {
        component.projectSelectionLists[alt].length = level + 1;
        if(level == 0) {
          component.projectSelectionLists.length = alt + 1;
        }
      }
      else if(projectId == -1) {
        component.projectSelectionLists[alt].length = level + 1;
        let parentId = 0;
        if(level > 0) {
          let parentProjectControl = levelArray.at(level - 1) as FormControl;
          parentId = parentProjectControl.value;
        }
        this.addProjectAlt = alt;
        this.addProjectLevel = level;
        this.addProjectParentId = parentId == 0 ? null : parentId;
        console.log("parentId = " + parentId);
      }
      else {
        component.projectSelectionLists[alt].length = level + 2;
        let observable = component.apiService.getProjects(projectId);
        observable.subscribe( data => {
          component.populateProjectSelectionsLists(alt, level + 1, data, selectedProjects);
        });
      }
    });
    projectControl.setValue(selectedProjectId);
    if(level == 1 && alt == this.projectSelectionLists.length - 1) {
      // add another alt selector
      console.log(`add another alt: ${alt + 1}`);
      this.projectSelectionLists[alt + 1] = [[{ id: 0, parentId: null, code: 'Loading...' }]];
      let observable = this.apiService.getRootProjects();
      observable.subscribe( data => {
        this.populateProjectSelectionsLists(alt + 1, 0, data, selectedProjects);
      });
    }
  }

  addProject(alt: number, level: number): boolean {
    return this.addProjectAlt == alt && this.addProjectLevel == level;
  }

  saveProjectName(): void {
    console.log(`saveProjectName ${this.addProjectAlt} ${this.addProjectLevel} ${this.addProjectParentId}`);
    let project = {id: null, parentId: this.addProjectParentId, code: this.addProjectName};
    let component = this;
    this.apiService.createProject(project).subscribe( data => {
      console.log(data.result);
      let newProject = data.result;
      component.apiService.getProjects(this.addProjectParentId).subscribe( data => {
        console.log(data.result);
        let selProj = [];
        selProj[this.addProjectAlt] = [];
        selProj[this.addProjectAlt][this.addProjectLevel] = newProject.id;
        component.populateProjectSelectionsLists(this.addProjectAlt, this.addProjectLevel, data, selProj);
        component.cancelProjectName();
      });
    });
  }

  cancelProjectName(): void {
    this.addProjectAlt = -1;
    this.addProjectLevel = -1;
    this.addProjectParentId = -1;
  }

  addProjectName: string = '';

  projectNameKeyup(event: any): void {
    this.addProjectName = event.target.value;
  }

  cancel() {
    this.location.back();
  }

  onSubmit() {
    let formEvent: FormEvent = this.editForm.value;
    console.warn(formEvent);
    this.apiService.saveEvent(formEvent)
      .subscribe( data => {
        let dateString = formatDate(formEvent.date, 'yyyy-MM-dd', 'en-US');
        this.router.navigate(['list-event', {date: dateString}]);
      });
  }
}
