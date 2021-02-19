<template>
  <div style="background: #fff;padding: 10px;">
    <div style="text-align: right;">
      <Button type="success" @click="exportExport">导出报表</Button>
    </div>
    <!-- <div class="filter">
      <Form ref="form" :rules="formValidate" :label-width="90" :model="form">
        <div>
          <FormItem label="项目名称" prop="name">
            <Input placeholder="请输入项目名称" @on-enter="changePage(1)" v-model="form.name" />
          </FormItem>
          <FormItem label="项目编号" prop="code">
            <Input placeholder="请输入项目编号" v-model="form.code" @on-enter="changePage(1)" />
          </FormItem>
          <FormItem label="项目状态" prop="statusIds">
            <Select v-model="form.statusIds" placeholder="请选择" @on-change="changePage(1)" :clearable="true" multiple>
              <Option v-for="(item, index) in proStatusList" :value="item.id" :key="index">{{item.name}}</Option>
            </Select>
          </FormItem>
          <br>
           <FormItem label="项目阶段" prop="phaseIds">
            <Select v-model="form.phaseIds" placeholder="请选择" @on-change="changePage(1)" :clearable="true" multiple>
              <Option v-for="(item, index) in proPhaselist" :value="item.id" :key="index">{{item.name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="服务客户" prop="serviceCustomerIds">
            <Select v-model="form.serviceCustomerIds" :filterable="true" :clearable="true" placeholder="请选择" @on-change="changePage(1)" multiple>
              <Option v-for="(item, index) in customlist" :value="item.id" :key="index">{{item.name}}</Option>
            </Select>
          </FormItem>
          <br>
          <FormItem label="项目经理" prop="pjms">
            <Select v-model="form.pjms" :filterable="true" :clearable="true" placeholder="请选择" @on-change="changePage(1)" multiple>
              <Option v-for="(item, index) in userlist.u1" :value="item.id.toString()" :key="index">{{item.actualName}} {{item.email}}</Option>
            </Select>
          </FormItem>
          <FormItem label="客户成功经理" prop="csms">
            <Select v-model="form.csms" :filterable="true" :clearable="true" placeholder="请选择" @on-change="changePage(1)" multiple>
              <Option v-for="(item, index) in userlist.u2" :value="item.id.toString()" :key="index">{{item.actualName}} {{item.email}}</Option>
            </Select>
          </FormItem>
          <div class="ivu-form-item" style="text-align: right;">
            <Button icon="ios-search" @click="changePage(1)">查询</Button>
          </div>
       </div>
       <div>
       </div>
    </Form>
    </div> -->
    <!-- 搜索结果 -->
    <div style="padding-top: 10px;">
      <!-- 表格 -->
          <MergeTable
          ref="childtable"
          :height="600"
          :columns="columnsmergin"
          :data="result"
          :reportname="'项目概览报表'"
          />
      <div style="padding-top: 10px;">
        <span>共找到 {{ pages.totalPage }} 条数据</span>
      </div>
    </div>
    <!-------添加、更新 begin------->
        <!-- <Modal
                :footer-hide="true"
                :title="saveModal.isUpdate?'更新':'新建'"
                v-model="saveModal.show"
                @on-cancel="saveFormClose"
                width="700"
                :styles="{top: '10px'}"
        >
            <overviewColorForm
                    :isUpdate="saveModal.isUpdate"
                    :updateData="colorconfig"
                    @on-form-close="saveFormClose"
            />
        </Modal> -->
  </div>
</template>

<script>
import { pageparam } from '@/common/listparams';
import { prooverviewApi } from '@/api/proreport/projectoverview';
// import { proprogressApi } from '@/api/proreport/proprogress';
import { prostatusApi } from '@/api/baseinfo/project/prostatus';
import { protypeApi } from '@/api/baseinfo/project/protype';
import { prophaseApi } from '@/api/baseinfo/project/prophase';
import { usersApi } from '@/api/role/userlist';
import { custominfoApi } from '@/api/custominfo';
import commonfilters from '@/common/filters';
import MergeTable from '../components/merge-table';
import { dateFormat, utils } from '@/lib/util';
import enumInfo from '@/constants';
// import overviewColorForm from './components/overview-color-form';
import router from '@/router';
import store from '@/store';
export default {
  components: {
    MergeTable
    // overviewColorForm
    // DatepickerRangeForm
  },
  data () {
    return {
      selectIds: [],
      startDate: '',
      endDate: '',
      userlist: {
        u1: [], // 1 项目经理
        u2: [] // 2 客户成功经理
        // u3: [], // 3 销售
        // u4: [], // 4 售后
        // u5: [] // 5 技术负责人
      }, // 用户下拉列表
      customlist: [],
      exportModal: {
        show: false
      },
      daterange: {
        startDate: '',
        endDate: ''
      },
      form: {
        // name: '',
        // code: '',
        // statusIds: [],
        // phaseIds: [],
        // serviceCustomerIds: [],
        // pjms: [],
        // csms: [],
        startdate: '',
        enddate: '',
        pageNum: 1,
        pageSize: 100000,
        orders: [
          {
            'asc': false,
            'column': 'create_time'
          }
        ]
      },
      pages: {
        totalPage: 0
      },
      // 表单验证
      formValidate: {
      },
      saveModal: {
        show: false,
        isUpdate: false,
        updateData: null
      },
      // isShowTablesLoading: false,
      columnsmergin: [
        [
          {
            key: 'code',
            title: '项目code',
            cols: 1,
            rows: 1,
            fixed: true, // 是否固定
            action: (row) => {
              this.$router.push({ name: 'projectManageInfoView', query: { id: row.id } });
            },
            renderstyle: (v) => {
              return { color: '#2D8cF0' };
            }
            // mergin: true // 是否合并相同单元格
          },
          {
            key: 'name',
            title: '项目名称',
            cols: 1,
            rows: 1,
            fixed: true // 是否固定
            // mergin: true // 是否合并相同单元格
          },
          {
            key: 'csm',
            title: '客户成功经理',
            cols: 1,
            rows: 1
          },
          {
            key: 'pjm',
            title: '项目经理',
            cols: 1,
            rows: 1
          },
          {
            key: 'projectStatus',
            title: '项目状态',
            cols: 1,
            rows: 1
          },
          {
            key: 'industry',
            title: '行业类型',
            cols: 1,
            rows: 1
          },
          {
            key: 'startDate',
            title: '项目启动日期',
            width: 140,
            cols: 1,
            rows: 1,
            // sortrow: true, // true 排序传参数返回整条数据
            sorts: (a, b) => {
              // let a = arow.startDate;
              // let b = brow.startDate;
              let s = -1;
              let e = -1;
              try {
                s = new Date(a.replace(/-/g, '/')).getTime();
                e = new Date(b.replace(/-/g, '/')).getTime();
              } catch (error) {
                console.log(error);
              }
              return s < e;
            },
            render: (v) => {
              if (!v) {
                return v;
              }
              return v.split(' ')[0];
            }
          },
          {
            key: 'closePlanDate',
            title: '原计划结项日期',
            cols: 1,
            rows: 1,
            width: 150,
            sorts: (a, b) => {
              let s = -1;
              let e = -1;
              try {
                s = new Date(a.replace(/-/g, '/')).getTime();
                e = new Date(b.replace(/-/g, '/')).getTime();
              } catch (error) {
                console.log(error);
              }
              return s < e;
            },
            render: (v) => {
              if (!v) {
                return v;
              }
              return v.split(' ')[0];
            }
          },
          {
            key: 'launchPlanDate',
            title: '当前计划结项日期',
            cols: 1,
            rows: 1,
            width: 160,
            sorts: (a, b) => {
              // let a = arow.launchPlanDate;
              // let b = brow.launchPlanDate;
              let s = -1;
              let e = -1;
              try {
                s = new Date(a.replace(/-/g, '/')).getTime();
                e = new Date(b.replace(/-/g, '/')).getTime();
              } catch (error) {
                console.log(error);
              }
              return s < e;
            },
            render: (v) => {
              if (!v) {
                return v;
              }
              return v.split(' ')[0];
            }
          },
          {
            key: 'contractTotalAmount',
            title: '合同总金额(¥)',
            cols: 1,
            rows: 1,
            width: 140,
            render: commonfilters.moneyformats,
            align: 'right',
            sorts: (a, b) => {
              return a < b;
            }
          },
          {
            key: 'milestoneStatus',
            title: '进度状态',
            cols: 1,
            rows: 1,
            width: 120,
            sorts: (a, b) => {
              return a > b;
            },
            render: (v) => {
              if (v === null || v === undefined) {
                return v;
              }
              let map = enumInfo.OPTION_ENUM.MILE;
              if (map['m' + v]) {
                return map['m' + v];
              }
              return v;
            },
            renderstyle: (row) => {
              let v = row.milestoneStatus;
              if (v === null || v === undefined) {
                return {};
              }
              let bgcolor = '#fff';
              let map = enumInfo.OPTION_ENUM.MILECOLOR;
              if (map['m' + v]) {
                bgcolor = map['m' + v];
              }
              return { 'backgroundColor': bgcolor };
              // return { 'backgroundColor': bgcolor, 'color': bgcolor };
            }
          },
          {
            key: 'actualCost',
            title: '成本状态',
            cols: 1,
            rows: 1,
            sortrow: true, // true 排序传参数返回整条数据
            sorts: (arow, brow, sortDir) => {
              if (!arow.baseCost) {
                return sortDir === true;
              }
              if (!brow.baseCost) {
                return (sortDir === false);
              }
              if (arow.actualCost === undefined || arow.actualCost === null) {
                return sortDir === true;
              }
              if (brow.actualCost === undefined || brow.actualCost === null) {
                return sortDir === false;
              }
              let s = (arow.actualCost - arow.baseCost) / arow.baseCost;
              let e = (brow.actualCost - brow.baseCost) / brow.baseCost;
              return s > e;
            },
            render: (v, row) => {
              if (row.actualCost === null || row.actualCost === undefined || row.baseCost === null || row.baseCost === undefined || isNaN(row.actualCost) || isNaN(row.baseCost) || row.baseCost === 0) {
                return '';
              }
              return commonfilters.formartPercent((row.actualCost - row.baseCost) / row.baseCost).toFixed(2) + '%';
            },
            renderstyle: (row) => {
              if (row.actualCost === null || row.actualCost === undefined || row.baseCost === null || row.baseCost === undefined || isNaN(row.actualCost) || isNaN(row.baseCost) || row.baseCost === 0) {
                return '';
              }
              let bgcolor = '#fff';
              let v = (row.actualCost - row.baseCost) / row.baseCost;
              if (v <= 0.1) {
                bgcolor = enumInfo.OPTION_ENUM.COSTCOLOR.m0;
              } else if (v <= 0.3) {
                bgcolor = enumInfo.OPTION_ENUM.COSTCOLOR.m1;
              } else {
                bgcolor = enumInfo.OPTION_ENUM.COSTCOLOR.m2;
              }
              return { 'backgroundColor': bgcolor };
              // return { 'backgroundColor': bgcolor, 'color': bgcolor };
            }
          },
          {
            key: 'satisficing',
            title: '满意度状态',
            cols: 1,
            rows: 1,
            width: 120,
            sorts: (a, b, sortdir) => {
              if (a && b) {
                return a > b;
              } else if (a === 0) {
                return sortdir === true;
              }
              return sortdir === false;
            },
            render: (v) => {
              if (v === null || v === undefined || v === 0) {
                return '';
              }
              let map = enumInfo.OPTION_ENUM.SATI;
              if (map['m' + v]) {
                return map['m' + v];
              }
              return v;
            },
            renderstyle: (row) => {
              let v = row.satisficing;
              if (v === null || v === undefined) {
                return {};
              }
              let bgcolor = '#fff';
              let map = enumInfo.OPTION_ENUM.SATICOLOR;
              if (map['m' + v]) {
                bgcolor = map['m' + v];
              }
              return { 'backgroundColor': bgcolor };
              // return { 'backgroundColor': bgcolor, 'color': bgcolor };
            }
          },
          {
            key: 'contractStatus',
            // title: '合同风险',
            title: '项目风险',
            cols: 1,
            rows: 1,
            width: 120,
            sorts: (a, b) => {
              return a > b;
            },
            render: (v) => {
              if (v === null || v === undefined) {
                return v;
              }
              let map = enumInfo.OPTION_ENUM.CONT;
              if (map['m' + v]) {
                return map['m' + v];
              }
              return v;
            },
            renderstyle: (row) => {
              let v = row.contractStatus;
              if (v === null || v === undefined) {
                return {};
              }
              let bgcolor = '#fff';
              let map = enumInfo.OPTION_ENUM.CONTCOLOR;
              if (map['m' + v]) {
                bgcolor = map['m' + v];
              }
              return { 'backgroundColor': bgcolor };
              // return { 'backgroundColor': bgcolor, 'color': bgcolor };
            }
          },
          {
            key: 'quality',
            title: '质量状态',
            cols: 1,
            rows: 1,
            width: 120,
            sorts: (a, b, sortDir) => {
              // let a = arow.quality;
              // let b = brow.quality;
              if (a && b) {
                return a > b;
              } else if (a === 0) {
                return sortDir === true;
              }
              return sortDir === false;
            },
            render: (v) => {
              if (v === null || v === undefined || v === 0) {
                return '';
              }
              let map = enumInfo.OPTION_ENUM.QUAL;
              if (map['m' + v]) {
                return map['m' + v];
              }
              return v;
            },
            renderstyle: (row) => {
              let v = row.quality;
              if (v === null || v === undefined) {
                return {};
              }
              let bgcolor = '#fff';
              let map = enumInfo.OPTION_ENUM.QUALCOLOR;
              if (map['m' + v]) {
                bgcolor = map['m' + v];
              }
              return { 'backgroundColor': bgcolor };
              // return { 'backgroundColor': bgcolor, 'color': bgcolor };
            }
          }
        ]
      ],
      colorconfig: [],
      result: [],
      proTypelist: [], // 项目类型
      proPhaselist: [], // 项目阶段
      proStatusList: [] // 项目状态
    };
  },
  created () {
  },
  mounted () {
    // this.iniDateRange();
    // this.colorconfig = this.getColorConfig();
    this.initParamDate();
    this.getProlist();
    // this.getuserlist(1);
    // this.getuserlist(2);
    // this.getprotypelist();
    // this.getproPhaselist();
    // this.getcustomlist();
    // this.queryprostatuslist();
  },
  methods: {
    // 初始化时间参数
    initParamDate () {
      let thisSeasonDate = this.commonfns.thisSeasonDate();
      this.form.startdate = thisSeasonDate.begin;
      this.form.enddate = thisSeasonDate.end;
      // let n = new Date();
      // let nm = n.getMonth();
      // let ny = n.getFullYear();
      // // let nm = 12;
      // let sm = nm + 1 - nm % 3;
      // if (sm < 10) {
      //   sm = '0' + sm;
      // }
      // this.form.startdate = ny + '-' + sm + '-01 00:00:00';
      // this.form.enddate = utils.getDate(n, dateFormat.YMDHMS);
    },
    // 获取客户信息下拉列表
    async getcustomlist () {
      pageparam.pageSize = -1;
      let data = await custominfoApi.getlist(pageparam);
      this.customlist = data.data.list;
    },
    exportExport () {
      this.$refs.childtable.exportExport();
    },
    async getuserlist (roleId) {
      let data = await usersApi.getuserlist(roleId);
      this.userlist['u' + roleId] = [];
      if (data.success && data.data) {
        data.data.forEach(user => {
          if (user) {
            this.userlist['u' + roleId].push(user);
          }
        });
      }
    },
    // 项目类型列表
    async getprotypelist () {
      let data = await protypeApi.getlist(pageparam);
      if (data && data.success) {
        this.proTypelist = data.data.list;
      }
    },
    // 项目阶段列表
    async getproPhaselist () {
      let data = await prophaseApi.getlist(pageparam);
      if (data && data.success) {
        this.proPhaselist = data.data.list;
      }
    },
    // 查询项目状态管理数据
    async queryprostatuslist () {
      let obj = await prostatusApi.getlist(pageparam);
      if (obj && obj.success) {
        this.proStatusList = obj.data.list;
      }
    },
    // 获取项目列表
    async getProlist () {
      this.$Spin.show();
      // this.isShowTablesLoading = true;
      let data = await prooverviewApi.getlist(this.form);
      if (data && data.success) {
        this.result = data.data.list;
        this.pages.totalPage = data.data.total;
      }
      this.$Spin.hide();
      // this.isShowTablesLoading = false;
    },
    // 翻页
    changePage (ind) {
      this.form.pageNum = ind;
      this.getProlist();
    },
    saveFormClose () {
      this.saveModal.show = false;
      this.getProlist();
    },
    editColorConfig () {
      this.saveModal.show = true;
    }
  }
};
</script>

<style scoped>
.tit {
  text-align: right;
  padding-bottom: 10px;
}
.filter .ivu-btn {
  margin-left: 10px;
}
.filter {
  border-bottom: 1px solid #ddd;
}
.filter .ivu-form-item {
  display: inline-block;
  margin: 0 10px 10px 0;
  width: 300px;
}
</style>
