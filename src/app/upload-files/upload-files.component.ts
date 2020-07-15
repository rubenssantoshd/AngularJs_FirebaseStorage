import { Component, OnInit } from '@angular/core';
import { FilesService } from '../files.service';
import { FileEntry } from '../models/fileentry.models';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})
export class UploadFilesComponent implements OnInit {

  files: FileEntry[] = [];

  constructor(private fileService: FilesService) { }

  ngOnInit(): void {
  }

  onDropFiles(files: FileList){
    this.files.splice(0, this.files.length);
    for (let i = 0; i< files.length; i++){                
      this.files.push({
        file: files[i], percentage: null, 
        task: null, uploading: null, finished: null, 
        paused: null, error: null,  canceled: null, 
        bytesuploaded: null, state: null , 
      });
     }
  }

  removeFileFromList(i){
    this.files.splice(i,1);
  }

  uploadAll(){
    for(let i = 0; i < this.files.length; i++){
      console.log(this.files[i]);
      this.fileService.upload(this.files[i]);
    }
      
  }

}
