import { UploadingService } from './../../uploading.service';
import {
  Component,
  OnInit,
  ViewChild,
  NgZone,
  Inject,
  ChangeDetectorRef,
  EventEmitter
} from '@angular/core';

import { RequisitionTypeService } from "../requisition-type.service";
import { RequisitionService } from "../requisition.service";
import { AlertService } from "../../alert.service";

import { IMyOptions } from 'mydatepicker-th';
import { JwtHelper } from 'angular2-jwt';

import * as moment from 'moment';
import * as _ from 'lodash';
import { IRequisitionOrder } from 'app/shared';

@Component({
  selector: 'wm-requisition',
  templateUrl: './requisition.component.html'
})
export class RequisitionComponent implements OnInit {
  @ViewChild('htmlPreview') public htmlPreview: any;
  @ViewChild('modalLoading') public modalLoading: any;

  filesToUpload: Array<File> = [];
  token: any;
  orders: any = [];
  approveds: any = [];
  unpaids: any = [];
  waitingApproves: any = [];

  constructor(
    private alertService: AlertService,
    private requisitionService: RequisitionService,
    private uploadingService: UploadingService,
    private ref: ChangeDetectorRef,
    @Inject('DOC_URL') private docUrl: string,
    @Inject('REQ_PREFIX') private documentPrefix: string,
    @Inject('API_URL') private url: string,
    @Inject('API_URL') private apiUrl: string
  ) {
    this.token = sessionStorage.getItem('token');
  }

  async ngOnInit() {
    this.loadData();
  }

  async loadData() {
    await this.getWaiting();
    await this.getWaitingApprove();
    await this.getApproved();
    await this.getUnPaid();
  }

  async getWaiting() {
    this.modalLoading.show();
    try {
      let rs: any = await this.requisitionService.getWating();
      this.modalLoading.hide();
      if (rs.ok) {
        this.orders = rs.rows;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async getUnPaid() {
    this.modalLoading.show();
    try {
      let rs: any = await this.requisitionService.getUnPaid();
      this.modalLoading.hide();
      if (rs.ok) {
        this.unpaids = rs.rows;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async getWaitingApprove() {
    this.modalLoading.show();
    try {
      let rs: any = await this.requisitionService.getWaitingApprove();
      this.modalLoading.hide();
      if (rs.ok) {
        this.waitingApproves = rs.rows;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async getApproved() {
    this.modalLoading.show();
    try {
      let rs: any = await this.requisitionService.getApproved();
      this.modalLoading.hide();
      if (rs.ok) {
        this.approveds = rs.rows;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async removeOrder(order: IRequisitionOrder) {
    this.alertService.confirm('ต้องการลบรายการนี้ [' + order.requisition_code + ']')
      .then(async () => {
        this.modalLoading.show();
        try {
          let rs: any = await this.requisitionService.removeRequisitionOrder(order.requisition_order_id);
          this.modalLoading.hide();
          if (rs.ok) {
            this.alertService.success();
            this.loadData();
          } else {
            this.alertService.error(rs.error);
          }
        } catch (error) {
          this.alertService.error(error.message);
        }
      }).catch(() => {
        this.modalLoading.hide();
      });
  }

  doApprove(order: any) {
    this.alertService.confirm('ต้องการอนุมัติรายการนี้ ใช่หรือไม่?')
      .then(async () => {
        this.modalLoading.show();
        try {
          let rs: any = await this.requisitionService.saveApproveOrderConfirm(order.confirm_id);
          this.modalLoading.hide();
          if (rs.ok) {
            this.alertService.success();
            this.loadData();
          } else {
            this.alertService.error(rs.error);
          }
        } catch (error) {
          this.modalLoading.hide();
          this.alertService.error(error.message);
        }
      })
      .catch(() => {
        this.modalLoading.hide();
      });
  }
  printApprove(order: any) {
    let url = this.url + '/report/approve/requis/' + order.requisition_order_id + `?token=${this.token}`;
    this.htmlPreview.showReport(url);
  }
  printSetProduct(order: any) {
    let url = this.url + '/report/list/requis/' + order.requisition_order_id + `?token=${this.token}`;
    this.htmlPreview.showReport(url);
  }
}
