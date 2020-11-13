import { Component, OnInit } from '@angular/core';
import { ApiService } from "../service/api.service";

class UploadRow {
  uploadId: number;
  uploadDate: Date;
  filename: string;
  minDate: Date;
  maxDate: Date;
}

class Client {
  id: number;
  name: string;
}

class Project {
  id: number;
  name: string;
  clientId: number;
}

class Task {
  id: number;
  name: string;
  projectId: number;
}

class DetailRow {
  eventId: number;
  date: Date;
  client: Client;
  project: Project;
  task: Task;
  notes: string;
  hours: number;
}

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit {

  uploadRows: UploadRow[] = [];
  detailRows: DetailRow[] = [];
  currentUploadId: number = 0;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.apiService.getUploadReport().subscribe( data => {
      if(data.status != 200) {
        alert(data.message);
        return;
      }
      this.uploadRows = data.result;
    });
  }

  uploadFile(event) {
    console.log(event);
    for (let index = 0; index < event.length; index++) {
      const file = event[index];
      this.apiService.postFile(file).subscribe( data => {
          console.log("file uploaded:", data);
          if(data.status != 200) {
            alert(data.message);
            return;
          }
          this.detailRows = data.result;
          this.apiService.getUploadReport().subscribe( data => {
            if(data.status != 200) {
              alert(data.message);
              return;
            }
            this.uploadRows = data.result;
            this.currentUploadId = this.uploadRows[0].uploadId;
          });
        },
        error => {
          console.log(error);
        });
    }  
  }

  showDetail(uploadId: number) {
    this.apiService.getUploadDetailReport(uploadId).subscribe( data => {
      console.log(data);
      this.currentUploadId = uploadId;
      this.detailRows = data.result;
    });
  }
}
