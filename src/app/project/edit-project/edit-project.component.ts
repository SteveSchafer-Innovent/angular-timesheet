import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ApiService } from "../../service/api.service";

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
  id: number;
  parentId: number;

  ngOnInit(): void {
    if(!window.localStorage.getItem('token')) {
      this.router.navigate(['login']);
      return;
    }
    this.nameControl = new FormControl('');
    this.editForm = new FormGroup({
      name: this.nameControl
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.id = +params.get('id');
      this.parentId = +params.get('parentId');
      this.title = (this.id == 0 ? "Add" : "Edit") + " Project";
      console.log(`param id = ${this.id}, parentId = ${this.parentId}`);
      if(this.id != 0) {
        this.apiService.getProject(this.id).subscribe( data => {
          let project = data.result;
          console.log(project);
          this.nameControl.setValue(project.code);
        });
      }
    });
  }

  cancel() {
    this.location.back();
  }

  onSubmit() {
    console.log("EditProjectComponent.onSubmit this.editForm.value:");
    console.log(this.editForm.value);
    if(this.id == 0) {
      if(this.parentId == 0) {
        this.apiService.addRootProject(this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
      else {
        this.apiService.addProject(this.parentId, this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
    }
    else {
      if(this.parentId == 0) {
        this.apiService.editRootProject(this.id, this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
      else {
        this.apiService.editProject(this.id, this.parentId, this.editForm.value.name)
          .subscribe( data => {
            this.location.back();
          });
      }
    }
  }
}
