import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { MatSelectModule } from '@angular/material/select';
import { formatDate } from '@angular/common';

import { ApiService } from "../../service/api.service";
import { Project } from '../../model/project.model';
import { ApiResponse } from '../../model/api.response';

class TreeProject {
  children: TreeProject[];
  expanded: boolean;
  loaded: boolean;
  constructor(
    readonly parent: TreeProject,
    readonly id: number,
    readonly code: string
    ) {
    this.children = [];
    this.expanded = false;
    this.loaded = false;
    if(this.id == null) {
      debugger;
    }
  }
}

class ListProject {
  canDelete: boolean;
  constructor(
    readonly level: number,
    readonly treeProject: TreeProject
    ) {
    this.canDelete = false;

  }
  showPlus(): boolean {
    return this.treeProject.children.length > 0 && this.treeProject.loaded && !this.treeProject.expanded;
  }
  showMinus(): boolean {
    return this.treeProject.children.length > 0 && this.treeProject.loaded && this.treeProject.expanded;
  }
}

@Component({
  selector: 'app-list-project',
  templateUrl: './list-project.component.html',
  styleUrls: ['./list-project.component.css']
})
export class ListProjectComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  listProjects: ListProject[];
  rootProjects: TreeProject[];

  ngOnInit(): void {
    if(!window.localStorage.getItem('token')) {
      this.router.navigate(['login']);
      return;
    }
    this.load();
  }

  load(): void {
    this.listProjects = [];
    this.rootProjects = [];
    this.apiService.getRootProjects().subscribe( data => {
      for(let i = 0; i < data.result.length; i++) {
        let dataResult = data.result[i];
        let rootProject = new TreeProject(null, dataResult.id, dataResult.code);
        this.rootProjects.push(rootProject);
        this.loadChildren(rootProject);
        let listProject = new ListProject(0, rootProject);
        this.apiService.canDeleteProject(listProject.treeProject.id).subscribe( data => {
          listProject.canDelete = data.result;
        });
        this.listProjects.push(listProject);
      }
    });
  }

  loadChildren(project: TreeProject): void {
    project.loaded = false;
    this.apiService.getProjects(project.id).subscribe( data => {
      project.children = [];
      for(let i = 0; i < data.result.length; i++) {
        let dataResult = data.result[i];
        let childProject = new TreeProject(project, dataResult.id, dataResult.code);
        project.children.push(childProject);
      }
      project.loaded = true;
    });
  }

  display(): void {
    this.listProjects = [];
    let component = this;
    let displayProject = function(level: number, treeProject: TreeProject): void {
      let listProject = new ListProject(level, treeProject);
      component.apiService.canDeleteProject(listProject.treeProject.id).subscribe( data => {
        listProject.canDelete = data.result;
      });
      component.listProjects.push(listProject);
      if(treeProject.expanded) {
        for(let i = 0; i < treeProject.children.length; i++) {
          let childProject = treeProject.children[i];
          displayProject(level + 1, childProject);
          if(!childProject.loaded) {
            component.loadChildren(childProject);
          }
        }
      }
    }
    for(let i = 0; i < this.rootProjects.length; i++) {
      let treeProject = this.rootProjects[i];
      displayProject(0, treeProject);
    }
    for(let i = 0; i < this.listProjects.length; i++) {
      let project = this.listProjects[i];
      if(!project.treeProject.loaded) {
        this.loadChildren(project.treeProject);
      }
    }
  }

  expand(project: ListProject): void {
    project.treeProject.expanded = true;
    this.display();
  }

  collapse(project: ListProject): void {
    project.treeProject.expanded = false;
    this.display();
  }

  addRootProject(): void {
    this.router.navigate(['edit-project']);
  }

  addProject(project: ListProject): void {
    this.router.navigate(['edit-project', {parentId: project.treeProject.id}]);
  }

  editProject(project: ListProject): void {
    this.router.navigate(['edit-project', {id: project.treeProject.id}]);
  }

  deleteProject(project: ListProject): void {
    let component = this;
    this.apiService.deleteProject(project.treeProject.id).subscribe( data => {
      if(data.status != 200) {
        alert(data.message);
      }
      component.load();
    });
  }

  events(): void {
    this.router.navigate(['list-event']);
  }
}
