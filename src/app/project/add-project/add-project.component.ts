import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ApiService } from "../../service/api.service";

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
 constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private apiService: ApiService
  ) { }

  addForm: FormGroup;
  parentId: number;

  ngOnInit(): void {
    if(!window.localStorage.getItem('token')) {
      this.router.navigate(['login']);
      return;
    }
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.parentId = +params.get('parentId');
      console.log("param parentId = " + this.parentId);
    });
    this.addForm = this.formBuilder.group({
      id: [],
      name: ['', Validators.required]
    });
   }

  onSubmit() {
    console.log("AddProjectComponent.onSubmit this.addForm.value:");
    console.log(this.addForm.value);
    let project = {id: null, parentId: this.parentId, code: this.addForm.value.name};
    this.apiService.createProject(project)
      .subscribe( data => {
        this.location.back();
      });
  }
}
