import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Project } from '../../model/project.model';
import { ApiService } from "../../service/api.service";
import { ApiResponse } from '../../model/api.response';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {
 constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private apiService: ApiService
  ) { }

  title: string;
  editForm: FormGroup;
  nameControl: FormControl;
  projectLevelArray: FormArray;
  id: number;
  parentId: number;
  projectSelectionLists: Project[][];

  ngOnInit(): void {
    if(!window.localStorage.getItem('token')) {
      alert('Not logged in');
      this.router.navigate(['list-event']);
      return;
    }
    this.nameControl = new FormControl('');
    this.projectLevelArray = new FormArray([]);
    this.editForm = new FormGroup({
      name: this.nameControl,
      parent: this.projectLevelArray,
    });
    this.projectSelectionLists = [[{ id: 0, parentId: null, code: 'Loading...' }]];
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.id = +params.get('id');
      this.parentId = +params.get('parentId');
      this.title = (this.id == 0 ? "Add" : "Edit") + " Project";
      console.log(`param id = ${this.id}, parentId = ${this.parentId}`);
      if(this.id != 0) {
        this.apiService.getProject(this.id).subscribe(data => {
          let project = data.result;
          console.log(project);
          this.nameControl.setValue(project.code);
          this.apiService.getProjectAncestry(this.id).subscribe( data => {
            let ancestry = data.result;
            console.log(ancestry);
            this.apiService.getRootProjects().subscribe( data => {
              this.populateProjectSelectionsLists(0, data, ancestry);
            });
          });
        });
      }
    });
  }

  populateProjectSelectionsLists(level: number, data: ApiResponse, selectedProjects: number[]): void {
    console.log(`populateProjectSelectionsLists level = ${level}`);
    console.log(data);
    console.log(selectedProjects);
    this.projectSelectionLists[level] = [
      { id: 0, parentId: null, code: 'Select project...' },
      { id: -1, parentId: null, code: 'Add project...' }
    ];
    for(let i = 0; i < data.result.length; i++) {
      let dataResult = data.result[i];
      let project = { id: dataResult.id, parentId: null, code: dataResult.code };
      console.log(project);
      this.projectSelectionLists[level].push(project);
    }
    // populate controls
    let levelArray: FormArray = this.projectLevelArray;
    levelArray.insert(level, new FormControl(0, Validators.required));
    console.log("init level " + level);
    let component = this;
    let projectControl = levelArray.at(level) as FormControl;
    let selectedProjectId = 0;
    if(selectedProjects != null  && selectedProjects.length > level) {
        selectedProjectId = selectedProjects[level];
    }
    projectControl.valueChanges.subscribe(projectId => {
      console.log(`level ${level}: on change projectId = ${projectId}`);
      for(let l = levelArray.length - 1; l > level; l--) {
        levelArray.removeAt(l);
      }
      if(projectId == 0) {
        component.projectSelectionLists.length = level + 1;
      }
      else if(projectId == -1) {
        component.projectSelectionLists.length = level + 1;
        let parentId = 0;
        if(level > 0) {
          let parentProjectControl = levelArray.at(level - 1) as FormControl;
          parentId = parentProjectControl.value;
        }
        console.log("parentId = " + parentId);
      }
      else {
        component.projectSelectionLists.length = level + 2;
        let observable = component.apiService.getProjects(projectId);
        observable.subscribe( data => {
          component.populateProjectSelectionsLists(level + 1, data, selectedProjects);
        });
      }
    });
    projectControl.setValue(selectedProjectId);
  }

  cancel() {
    this.location.back();
  }

  onSubmit() {
    console.log("EditProjectComponent.onSubmit this.editForm.value:");
    console.log(this.editForm.value);
    let name = this.editForm.value.name;
    let ancestry = this.editForm.value.parent;
    let parentId = ancestry.length >= 2 ? ancestry[ancestry.length - 2] : 0;
    if(this.id == 0) {
      if(parentId == 0) {
        this.apiService.addRootProject(this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
      else {
        this.apiService.addProject(parentId, this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
    }
    else {
      if(parentId == 0) {
        this.apiService.editRootProject(this.id, this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
      else {
        this.apiService.editProject(this.id, parentId, this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
    }
  }
}
