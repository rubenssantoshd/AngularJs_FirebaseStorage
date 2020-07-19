import { Component, OnInit } from '@angular/core';
import { FilesService } from '../files.service';
import { Observable } from 'rxjs';
import { MyFile } from '../models/myFile.model';

@Component({
  selector: 'app-my-files',
  templateUrl: './my-files.component.html',
  styleUrls: ['./my-files.component.css']
})
export class MyFilesComponent implements OnInit {

  files: Observable<MyFile[]>;

  constructor(private fileService: FilesService) { }

  ngOnInit(): void {

    this.files = this.fileService.getFiles();
    console.log('Files: ');
    this.files.subscribe( f => console.log(f)); 
  }

  getDate(n: number){
    return new Date(n);
  }

  delete(f: MyFile){
    this.fileService.deleteFile(f);
  }

}
