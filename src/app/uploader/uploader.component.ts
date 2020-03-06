import { Component } from '@angular/core';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent {

  isHovering: boolean;

  files: File[] = [];

  task: AngularFireUploadTask;

  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL;

  prueba: any[] = [];

  constructor(private storage: AngularFireStorage, private db: AngularFirestore) { }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.uploadImage(files.item(i));
      this.files.push(files.item(i));
    }
  }

  uploadImage(file: File) {
    const path = `test/${Date.now()}_${file.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    console.log(file);
    this.task = this.storage.upload(path, file);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();

    this.snapshot = this.task.snapshotChanges().pipe(
      tap(console.log),
      // The file's download URL
      finalize(async () => {
        console.log(ref);
        this.downloadURL = await ref.getDownloadURL().toPromise();
        console.log(this.downloadURL);

        localStorage.setItem('url', this.downloadURL);
        this.getUrl();
        console.log(path);

        this.db.collection('files').add({ downloadURL: this.downloadURL, path });
      }),
    );
  }

  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  getUrl() {
    const url = localStorage.getItem('url');

    if (url !== undefined || url !== null || url !== '') {
      this.prueba.push(url);
    }
    console.log(this.prueba);
  }


}
