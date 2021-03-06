import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { IMyOptions } from 'mydatepicker-th';
import { AlertService } from './../../../alert.service';
import * as moment from 'moment';
import { WarehouseService } from './../../warehouse.service';
import { BasicService } from '../../../basic.service';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { ProductsService } from 'app/admin/products.service';
import * as _ from 'lodash'
import { Router } from '@angular/router';
import { ReportsService } from 'app/admin/reports.service';
@Component({
  selector: 'wm-monthly-report',
  templateUrl: './monthly-report.component.html',
  styleUrls: ['./monthly-report.component.css']
})
export class MonthlyReportComponent implements OnInit {
  @ViewChild('htmlPreview') public htmlPreview: any;
  jwtHelper: JwtHelper = new JwtHelper();

  date = new Date();
  month = this.date.getMonth() + 1;
  year = this.date.getFullYear();
  dataYear = [];
  token: any;
  isPreview = false;
  warehouses: any = [];
  warehouseId: any;
  warehouseName: any;
  myDatePickerOptions: IMyOptions = {
    inline: false,
    dateFormat: 'dd mmm yyyy',
    editableDateField: false,
    showClearDateBtn: false
  };
  genericTypeSelect: any = []
  genericTypes = [];
  constructor(
    @Inject('API_URL') private apiUrl: string,
    private reportsService: ReportsService,
    private alertService: AlertService,
    private productService: ProductsService,
    private basicService: BasicService,
    private router: Router

  ) {
    this.token = sessionStorage.getItem('token');
    const decodedToken = this.jwtHelper.decodeToken(this.token);
    this.warehouseId = decodedToken.warehouseId
    this.warehouseName = decodedToken.warehouseName
  }

  ngOnInit() {
    this.getdate();
    this.getWarehouses();
    // this.getWarehouseList();
    const date = new Date();

  }
  refreshWaiting(state) {
    this.getGenericsType();
  }
  async getGenericsType() {
    try {
      const rs = await this.productService.getGenericType();
      if (rs.ok) {
        this.genericTypes = rs.rows;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }
  async monthlyReport() {
    let type = _.map(this.genericTypeSelect, function (v) {
      return 'genericTypes=' + v.generic_type_id;
    })
    const url = `${this.apiUrl}/report/monthlyReport?month=${this.month}&year=${this.year}&` + type.join('&') + `&token=${this.token}&warehouseId=${this.warehouseId}&warehouseName=${this.warehouseName}&ran=${moment().format('x')}`
    this.htmlPreview.showReport(url);
    // await this.reportsService.monthlyReport(this.month, this.year, type, this.warehouseId);
    // setTimeout(() => {
    //   this.router.navigate(['/admin/reports/process']);
    // }, 1000);

  }

  monthlyReportExcel() {
    let type = _.map(this.genericTypeSelect, function (v) {
      return 'genericTypes=' + v.generic_type_id;
    })
    const url = `${this.apiUrl}/report/monthlyReport/excel?month=${this.month}&year=${this.year}&` + type.join('&') + `&token=${this.token}&warehouseId=${this.warehouseId}`
    window.open(url);
  }

  async monthlyReportAll() {
    let type = _.map(this.genericTypeSelect, function (v) {
      return 'genericTypes=' + v.generic_type_id;
    })
    const url = `${this.apiUrl}/report/monthlyReportAll?month=${this.month}&year=${this.year}&` + type.join('&') + `&token=${this.token}&warehouseId=${this.warehouseId}`
    this.htmlPreview.showReport(url);
    // await this.reportsService.monthlyReportAll(this.month, this.year, type, this.warehouseId);
    // setTimeout(() => {
    //   this.router.navigate(['/admin/reports/process']);
    // }, 1000);
  }

  getdate() {
    for (let i = 0; i < 10; i++) {
      this.dataYear.push(this.date.getFullYear() - i)
    }
  }

  async getWarehouses() {
    const rs = await this.basicService.getWarehouses();
    if (rs.ok) {
      this.warehouses = rs.rows;
      // this.warehouseId = 'all';
    } else {
      this.alertService.error(rs.error);
    }
  }
}
