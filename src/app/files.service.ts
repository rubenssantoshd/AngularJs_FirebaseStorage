import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FileEntry } from './models/fileentry.models';
import { map, catchError, finalize } from 'rxjs/operators'; 
import { of, from, Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MyFile } from './models/myFile.model';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private filesCollection: AngularFirestoreCollection<MyFile>;

  constructor(private storage: AngularFireStorage, 
              private afs: AngularFirestore) 
  {    
    
  }

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
    f.task.snapshotChanges().pipe(
      finalize(() => {
        if(f.task.task.snapshot.state == 'success'){
          this.filesCollection.add({
            filename: f.file.name,
            path: path,
            date: (new Date()).getTime(),
            size: f.file.size
          })
        }
      })
    ).subscribe();     
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


  getFiles(): Observable<MyFile[]>{    
    this.filesCollection = this.afs.collection('myfiles', ref => ref.orderBy('date','desc')); 
    
    return this.filesCollection.snapshotChanges()
               .pipe(map((actions) => {
                 return actions.map( a => {
                   const file: MyFile = a.payload.doc.data();
                   const id = a.payload.doc.id;
                   const url = this.storage.ref(file.path).getDownloadURL();
                   return {id, ...file, url}; 
                 })
               })) 
  } 

  deleteFile(f: MyFile){
    this.storage.ref(f.path).delete();
    this.filesCollection.doc(f.id).delete();
  }
    
}
