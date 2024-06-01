import { Component, OnInit } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from '@angular/fire/firestore';
import { AlertController, InfiniteScrollCustomEvent } from '@ionic/angular';
@Component({
  selector: 'app-seguro-list',
  templateUrl: './seguro-list.page.html',
  styleUrls: ['./seguro-list.page.scss'],
})


export class SeguroListPage implements OnInit {
  constructor(
    private readonly firestore: Firestore,
    private alertCtrl: AlertController
  ) {}

  listaSeguros = new Array();
  maxResults = 4;
  ultimoSeguroRecuperado: any = null;
  isSearch: boolean = false;
  query = '';

  ngOnInit() {
    this.listaSeguros = new Array();
    this.ultimoSeguroRecuperado = null;
    this.listarSegurosSinFiltro();
  }

  ionViewWillEnter() {
    this.listaSeguros = new Array();
    this.ultimoSeguroRecuperado = null;
    this.listarSegurosSinFiltro();
  }

  listarSegurosSinFiltro = () => {
    console.log('Listar asegurados sin filtro');
    const segurosRef = collection(this.firestore, 'seguro');

    let q;
    if (this.ultimoSeguroRecuperado) {
      q = query(
        segurosRef,
        limit(this.maxResults),
        startAfter(this.ultimoSeguroRecuperado)
      );
    } else {
      q = query(segurosRef, limit(this.maxResults));
    }


    const querySnapshot = getDocs(q).then((re) => {
      if (!re.empty) {
        this.ultimoSeguroRecuperado = re.docs[re.docs.length - 1];

        re.forEach((doc) => {
          let seguro: any = doc.data();
          seguro.id = doc.id;

          if (!this.listaSeguros.some((a) => a.id === seguro.id)) {
            this.listaSeguros.push(seguro);
          }
        });
      } else {
        console.log('No hay mas asegurados para cargar.');
      }
    });

    console.log(this.listaSeguros);
  };

  onIonInfinite(ev: any) {
    this.listarSegurosSinFiltro();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  clickSearch = () => {
    this.isSearch = true;
  };

  clearSearch = () => {
    this.isSearch = false;
    this.query = '';

    this.listaSeguros = new Array();
    this.ultimoSeguroRecuperado = null;

    this.listarSegurosSinFiltro();
  };

  buscarSearch = (e: any) => {
    this.isSearch = false;
    this.query = e.target.value;

    this.listaSeguros = new Array();
    this.ultimoSeguroRecuperado = null;
    this.listarSeguros();
  };

  listarSeguros = () => {
    console.log('Listar asegurados');
    const segurosRef = collection(this.firestore, 'seguro');

    if ((this.query + '').length > 0) {
      let q = undefined;
      if (this.ultimoSeguroRecuperado) {
        q = query(
          segurosRef,
          where('nombre', '>=', this.query.toUpperCase()),
          where('nombre', '<=', this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults),
          startAfter(this.ultimoSeguroRecuperado)
        );
      } else {
        q = query(
          segurosRef,
          where('nombre', '>=', this.query.toUpperCase()),
          where('nombre', '<=', this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults)
        );
      }

      getDocs(q).then((re) => {
        if (!re.empty) {
          let listaSeguros = new Array();

          for (let i = 0; i < re.docs.length; i++) {
            const doc: any = re.docs[i].data();
            if (
              doc.nombre
                .toUpperCase()
                .startsWith(this.query.toUpperCase().charAt(0))
            ) {
              listaSeguros.push(re.docs[i]);
            }
          }

          this.ultimoSeguroRecuperado = re.docs[listaSeguros.length - 1];

          for (let i = 0; i < listaSeguros.length; i++) {
            const doc: any = listaSeguros[i];
      
            let seguro: any = doc.data();
            seguro.id = doc.id;
            this.listaSeguros.push(seguro);
          }
        }
      });
    } else {
      this.listarSegurosSinFiltro();
    }
  };
}