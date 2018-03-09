import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from 'app/alert.service';
import * as moment from 'moment';
import { HisTransactionService } from 'app/staff/his-transaction.service';
import { error } from 'util';

@Component({
  selector: 'wm-his-issue-transaction',
  templateUrl: './his-issue-transaction.component.html',
})
export class HisIssueTransactionComponent implements OnInit {
  @ViewChild('modalLoading') public modalLoading;

  products = [];
  openUpload = false;
  filePath: string;
  fileName: any = null;
  file: any;
  perPage = 20;
  selected = [];

  constructor(
    private alertService: AlertService,
    private hisTransactionService: HisTransactionService
  ) {
  }

  ngOnInit() {
    this.getTransactionList();
  }

  async getTransactionList() {
    try {
      this.modalLoading.show();
      const rs: any = await this.hisTransactionService.getTransactionList();
      if (rs.ok) {
        this.products = rs.rows;
      } else {
        this.alertService.error(rs.error);
      }
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.serverError();
    }
  }

  showUploadModal() {
    this.openUpload = true;
  }

  fileChangeEvent(fileInput: any) {
    this.file = <Array<File>>fileInput.target.files;
    this.fileName = this.file[0].name;
  }

  async doUpload() {
    try {
      this.modalLoading.show();
      this.hisTransactionService.uploadHisTransaction(this.file[0])
        .then((result: any) => {
          if (result.ok) {
            this.openUpload = false;
          } else {
            this.alertService.error(JSON.stringify(result.error));
          }
          this.getTransactionList();
          this.modalLoading.hide();
        }, (error) => {
          this.modalLoading.hide();
          this.alertService.error(JSON.stringify(error));
        });
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(JSON.stringify(error));
    }
  }

  clearTemp() {
    this.alertService.confirm('ต้องการลบรายการทั้งหมดที่ยังไม่ตัดจ่าย ใช่หรือไม่?')
      .then(() => {
        this.modalLoading.show();
        this.hisTransactionService.removeTransactionList()
          .then((rs: any) => {
            if (rs.ok) {
              this.alertService.success();
              this.selected = [];
              this.getTransactionList();
            } else {
              this.alertService.error(rs.error);
            }
            this.modalLoading.hide();
          })
          .catch((error: any) => {
            this.modalLoading.hide();
            this.alertService.serverError();
          });
      }).catch(() => {
        // no action
      });
  }

  confirmImport() {
    const transactionIds: any = [];
    this.selected.forEach(v => {
      transactionIds.push(v.transaction_id);
    });

    if (transactionIds.length) {
      this.doImport(transactionIds);
    } else {
      this.alertService.error('ไม่พบรายการที่ต้องการ');
    }
  }

  confirmImportAll() {
    const transactionIds: any = [];
    this.products.forEach(v => {
      transactionIds.push(v.transaction_id);
    });

    if (transactionIds.length) {
      this.doImport(transactionIds);
    } else {
      this.alertService.error('ไม่พบรายการที่ต้องการ');
    }
  }

  doImport(transactionIds: any[]) {
    this.alertService.confirm('ต้องการนำเข้ารายการที่เลือก ' + transactionIds.length + ' รายการ ใช่หรือไม่?')
      .then(() => {
        this.modalLoading.show();
        this.hisTransactionService.importTransaction(transactionIds)
          .then((rs: any) => {
            if (rs.ok) {
              let isImportTotal = transactionIds.length - rs.un_cut_stock.length;
              this.alertService.success('ผลการนำเข้าข้อมูลเพื่อตัดสต๊อก', 'นำเข้าข้อมูลได้ ' + isImportTotal + ' รายการ ไม่สามารถนำเข้าได้ ' + rs.un_cut_stock.length + ' รายการ');
              this.getTransactionList();
            } else {
              this.alertService.error(rs.error);
            }
            this.modalLoading.hide();
          })
          .catch((error) => {
            this.modalLoading.hide();
            this.alertService.serverError();
          });
      }).catch(() => {

      });
  }
}