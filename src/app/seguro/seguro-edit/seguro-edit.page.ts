import { Component, OnInit } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  Firestore,
  doc,
  getDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  uploadBytesResumable,
  ref,
  Storage,
  getDownloadURL,
  StorageError,
  UploadTaskSnapshot,
} from '@angular/fire/storage';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-seguro-edit',
  templateUrl: './seguro-edit.page.html',
  styleUrls: ['./seguro-edit.page.scss'],
})
export class SeguroEditPage implements OnInit {
  registroForm = new FormGroup({
    id: new FormControl(''),
    Nombre: new FormControl(''),
    Apellido: new FormControl(''),
    FechaNacimiento: new FormControl(''),
    BienAsegurado: new FormControl(''),
    MontoAsegurado: new FormControl(''),
  });

  seguroId: string | null = null;

  seguro: any = {};

  avatar: string = '';

  constructor(
    private readonly firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) {}

  ngOnInit() {

    this.route.params.subscribe((params: any) => {
      console.log(params);
      this.seguroId = params.id;
    });
    if (this.seguroId) {
      this.obtenerSeguro(this.seguroId);
    }
  }

  incluirSeguro = () => {
    console.log('Aqui incluir en firebase');
    let segurosRef = collection(this.firestore, 'seguro');

    addDoc(segurosRef, this.registroForm.value)
      .then((doc) => {
        console.log('Registro hecho');
        this.router.navigate(['/seguro-list']);
      })
      .catch((error) => {
        console.error('Error al crear el seguro:', error);
      });
  };

  editarSeguro = (id: string) => {
    console.log('Aqui editar en firebase');
    let document = doc(this.firestore, 'seguro', id);

    updateDoc(document, this.registroForm.value)
      .then((doc) => {
        console.log('Registro editado');
        this.router.navigate(['/seguro-list']);
      })
      .catch((error) => {
        console.error('Error al editar el seguro:', error);
      });
  };

  obtenerSeguro = (id: string) => {
    console.log('Listar seguro');
    let documentRef = doc(this.firestore, 'seguro', id);

    getDoc(documentRef)
      .then((doc) => {
        if (doc.exists()) {
          this.obtenerAvatarSeguro();

          console.log('Detalle del seguro:', doc.data());
          this.seguro = doc.data();
          this.registroForm.setValue({
            id: this.seguroId || '',
            Nombre: this.seguro['Nombre'] || '',
            Apellido: this.seguro['Apellido'] || '',
            MontoAsegurado: this.seguro['MontoAsegurado'] || '',
            BienAsegurado: this.seguro['BienAsegurado'] || '',
            FechaNacimiento:
              this.seguro['FechaNacimiento  '] ||
              '',
          });
        } else {
          console.log('No se encontró el seguro con el ID proporcionado.');
        }
      })
      .catch((error) => {
        console.error('Error al consultar el seguro:', error);
      });
  };

  eliminarSeguro = (id: string) => {
    console.log('Aqui elimina en firebase');
    const document = doc(this.firestore, 'seguro', id);

    deleteDoc(document)
      .then(() => {
        console.log('Registro eliminado');
        this.router.navigate(['/seguro-list']);
      })
      .catch((error) => {
        console.error('Error al eliminar el seguro:', error);
      });
  };

  incluirOEditarSeguro() {
    if (this.seguroId) {
      this.editarSeguro(this.seguroId);
    } else {
      this.incluirSeguro();
    }
  }

  //nuevo codigo para la segunda parcial

  uploadFile = (input: HTMLInputElement) => {
    if (!input.files) return;

    const files: FileList = input.files;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        console.log(file, file.name);
        const storageRef = ref(this.storage, `avatars/seguro/${this.seguroId}`);

        uploadBytesResumable(storageRef, file).on(
          'state_changed',
          this.onUploadChange,
          this.onUploadError,
          this.onUploadComplete
        );
      }
    }
  };

  onUploadChange = (response: UploadTaskSnapshot) => {
    console.log('onUploadChange', response);
  };

  onUploadError = (error: StorageError) => {
    console.log('onUploadError', error);
  };

  onUploadComplete = () => {
    console.log('upload completo');
    this.editarAvatar();
    this.obtenerAvatarSeguro();
  };

  editarAvatar = () => {
    const document = doc(this.firestore, 'seguro', this.seguroId!);
    updateDoc(document, {
      avatar: `avatars/seguro/${this.seguroId}`,
    }).then((doc) => {
      console.log('Avatar editado');
    });
  };

  obtenerAvatarSeguro = () => {
    const storageRef = ref(this.storage, `avatars/seguro/${this.seguroId}`);
    console.log('storageRef', storageRef);

    getDownloadURL(storageRef).then((doc) => {
      this.avatar = doc;
    });
  };
}
