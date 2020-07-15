import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FileEntry } from './models/fileentry.models';
import { map, catchError } from 'rxjs/operators'; 
import { of, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private storage: AngularFireStorage) { }

  // uploadFile(f: File){   
  //   let path = `myfiles/${f.name}`;
  //   let task = this.storage.upload(path, f);

  //   task.snapshotChanges()
  //          .subscribe((s) => console.log(s));
  // }

  upload(f: FileEntry){
    let newFilename = `${(new Date()).getTime()}_${f.file.name}`;
    let path = `myfiles/${newFilename}`;
    f.task = this.storage.upload(path, f.file);

    f.state = f.task.snapshotChanges()
              .pipe(
                map((s) => f.task.task.snapshot.state),
                catchError((s) => {
                  return of(f.task.task.snapshot.state)
                })
              )
    this.fillAttributes(f);          
  }

  fillAttributes(f: FileEntry){
    f.percentage = f.task.percentageChanges();
    f.uploading = f.state.pipe(map((s) => s=="running"));
    f.finished = from(f.task).pipe(map((s) => s.state=="success"));
    f.paused = f.state.pipe(map((s) => s=="paused"));
    f.error = f.state.pipe(map((s)=> s=="error"));
    f.canceled = f.state.pipe(map((s) => s=="canceled"));
    f.bytesuploaded = f.task.snapshotChanges().pipe((map(s=> s.bytesTransferred))); 
  } 

}
