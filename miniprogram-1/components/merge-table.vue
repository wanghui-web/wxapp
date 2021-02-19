<template>
<div class="mergin-table-row" :class="'mergin-table-row' + columns.length">
    <div class="mergin-table-container" id="merginScrollBox">
      <div class="mergin-table-left-top">
        <table class="merge-table">
          <thead>
            <tr>
              <th v-for="(th, index) in fixedKey" :key="index">
                <span>{{ th.title }}</span>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="mergin-table-head">
        <table class="merge-table" id="merginHeadTable">
          <thead>
            <tr v-for="tr in columns" :key="tr.index">
              <th v-for="th in tr" :key="th.index" :rowspan="th.rows" :colspan="th.cols">
                <span>
                  {{th.title}}
                </span>
                <span v-if="th.sorts" @click="sortlist(th.sorts, th.key, th.sortrow)" class="sort" :class="{'actsort': actsort === th.key, 'sortasc': sortkey[th.key]}">
                </span>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="mergin-table-left">
        <table class="merge-table" id="merginLeftTable">
          <tbody>
            <tr v-for="l in list" :key="l.index">
              <template v-for="(k, index) in fixedKey">
                <td :key="k.index" :rowspan="l[k.key + 'span']" v-if="!l[k.key + 'dis']" :style="l[k.key + 'style' + index]? l[k.key + 'style' + index]: {}">
                  <span v-if="k.action" @click="k.action(l)" class="action-td">{{l[k.key]}}</span>
                  <span v-else >{{l[k.key]}}</span>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mergin-table-box" @scroll="tableScroll()" id="merginTableBox" :style="{'maxHeight': height + 'px'}">
        <table class="merge-table" id="mergeTableBody">
          <thead>
            <tr v-for="tr in columns" :key="tr.index">
              <th v-for="(th, thindex) in tr" :key="thindex" :rowspan="th.rows" :colspan="th.cols" :class="{'left-fixed-th': thindex < fixedKey.length}" :style="th.width? 'min-width: ' + th.width + 'px;': ''">
                <span>
                  {{th.title}}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in list" :key="l.index">
              <template v-for="(k, index) in columnsKey">
                <td :key="index" :rowspan="l[k.key + 'span']" v-if="!l[k.key + 'dis']" :style="l[k.key + 'style' + index]? l[k.key + 'style' + index]: {}" :class="k.align? 'text-' + k.align: ''">
                  <!-- <span>{{l[k.key]}}</span> -->
                  <span v-if="k.action" @click="k.action(l)" class="action-td">{{l[k.key]}}</span>
                  <span v-else >{{l[k.key]}}</span>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</div>
</template>
<script>
import { utils } from '@/lib/util';
import XLSX from 'xlsx';
// import XLSXStyle from 'xlsx-style';
export default {
  name: 'MergeTable',
  components: {
  },
  props: {
    height: {
      type: Number,
      default: 500
    },
    columns: {
      type: Array
    },
    data: {
      type: Array
    },
    reportname: {
      type: String,
      default: '项目报表'
    }
  },
  data () {
    return {
      actsort: '',
      sortkey: {},
      recordIndex: [],
      columnsKey: [],
      fixedKey: [],
      list: [],
      merginKey: []
    };
  },
  watch: {
    data (newValue, oldValue) {
      this.initSetting();
      this.MergeCell(newValue);
    }
  },
  created () {},
  mounted () {
    this.getColumskey();
  },
  methods: {
    // 初始化设置参赛
    initSetting () {
      this.actsort = '';
      for (let k in this.sortkey) {
        this.sortkey[k] = false;
      }
    },
    // 初始化高度
    initTableHei () {
      let btd = document.querySelectorAll('#merginTableBox tbody tr');
      let ltd = document.querySelectorAll('#merginLeftTable tbody tr');
      if (ltd.length <= 0) {
        return;
      }
      btd.forEach((dom, ind) => {
        if (ltd[ind] && ltd[ind].children.length > 0) {
          let hei = dom.children[0].offsetHeight;
          ltd[ind].children[0].style.height = hei + 'px';
          // dom.children[0].style.height = hei + 'px';
        }
      });
    },
    initTableWid () {
      let bth = document.querySelectorAll('#merginTableBox thead th');
      let tth = document.querySelectorAll('#merginHeadTable thead th');
      if (tth.length <= 0) {
        return;
      }
      bth.forEach((dom, ind) => {
        if (tth[ind]) {
          let wid = dom.offsetWidth;
          tth[ind].style.width = wid + 'px';
          tth[ind].style.minWidth = wid + 'px';
          tth[ind].style.maxWidth = wid + 'px';
        }
      });
    },
    exportExport () {
      // let name = '项目成本明细表';
      let name = this.reportname;
      let workbook = XLSX.utils.table_to_book(document.getElementById('mergeTableBody'));
      // let ws = workbook.Sheets.Sheet1;
      // for (let k in ws) {
      //   console.log(k);
      //   if (k.indexOf('T') > -1) {
      //     ws[k].s = {
      //       fill: {
      //         fgColor: { rgb: 'FFA3F4B1' }
      //       }
      //     };
      //   }
      // }
      // console.log(workbook);
      XLSX.writeFile(workbook, this.reportname + '.xlsx');
    },
    tableScroll () {
      let box = document.getElementById('merginTableBox');
      let elem1 = document.getElementById('merginHeadTable');
      let elem2 = document.getElementById('merginLeftTable');
      requestAnimationFrame(function () {
        elem1.style.marginLeft = -box.scrollLeft + 'px';
        elem2.style.marginTop = -box.scrollTop + 'px';
      });
    },
    // 收集需要展示的key
    getColumskey () {
      this.recordIndex = [];
      this.merginKey = [];
      this.columns.forEach((item, index) => {
        this.recordIndex.push({ colsIndex: 0 });
      });
      this.columns[0].forEach((item, index) => {
        this.getKeyByItem(item, 0);
      });
    },
    getKeyByItem (item, rowInd) {
      if (!item) {
        return;
      }
      if (item.cols > 1) {
        if (!this.columns[rowInd + 1]) {
          return;
        }
        let _this = this;
        let nextArr = this.columns[rowInd + 1];
        let start = this.recordIndex[rowInd + 1].colsIndex;
        let len = start + item.cols;
        let colsIndexs = 0;
        for (let i = start; i < len; i++) {
          if (colsIndexs >= item.cols) {
            break;
          }
          if (!_this.columns[rowInd + 1][i]) {
            break;
          }
          _this.getKeyByItem(_this.columns[rowInd + 1][i], rowInd + 1);
          colsIndexs += _this.columns[rowInd + 1][i].cols;
        }
      } else if (item.key) {
        this.columnsKey.push({ key: item.key, title: item.title, render: item.render, renderstyle: item.renderstyle, align: item.align, action: item.action });
        if (item.fixed) {
          this.fixedKey.push({ key: item.key, title: item.title, align: item.align, renderstyle: item.renderstyle, action: item.action });
        }
        if (item.mergin) {
          this.merginKey.push({ key: item.key, title: item.title, align: item.align });
        }
      }
      this.recordIndex[rowInd].colsIndex++;
    },
    // 排序
    sortlist (fn, key, sortrow) {
      if (this.sortkey[key] === null || this.sortkey[key] === undefined) {
        this.sortkey[key] = false;
      }
      this.sortkey[key] = !this.sortkey[key];
      this.actsort = key;
      let nlists = [];
      this.data.forEach((item) => {
        nlists.push(item);
      });
      for (let i = 0; i < nlists.length; i++) {
        for (let j = i + 1; j < nlists.length; j++) {
          if (nlists[j][key] === null || nlists[j][key] === undefined) {
            continue;
          }
          if (nlists[i][key] === null || nlists[i][key] === undefined) {
            nlists[i] = [nlists[j], nlists[j] = nlists[i]][0];
          } else {
            let sort = false;
            try {
              if (sortrow) {
                sort = fn(nlists[i], nlists[j], this.sortkey[key]);
              } else {
                sort = fn(nlists[i][key], nlists[j][key], this.sortkey[key]);
              }
            } catch (error) {
              console.log(error);
            }
            if (sort === this.sortkey[key]) {
              nlists[i] = [nlists[j], nlists[j] = nlists[i]][0];
            }
          }
        }
      }
      // console.log(this.data);
      this.MergeCell(nlists);
    },
    MergeCell (List) {
      if (!List) {
        this.list = [];
        return;
      }
      let nList = this.dealRenderList(List); // 先处理render数据
      this.list = new Array(nList.length);
      if (this.merginKey.length <= 0) {
        this.list = nList;
      } else {
        for (let k in this.merginKey) {
          let i = 0;
          let key = this.merginKey[k].key;
          while (i < nList.length) {
            if (!this.list[i]) {
              this.list[i] = nList[i];
            }
            this.list[i][key + 'span'] = 1;
            this.list[i][key + 'dis'] = false;
            let j = i + 1;
            for (j; j < nList.length; j++) {
              if (nList[i][key] && (nList[i][key] === nList[j][key])) {
                if (!this.list[j]) {
                  this.list[j] = nList[j];
                }
                this.list[i][key + 'span']++;
                this.list[i][key + 'dis'] = false;
                this.list[j][key + 'span'] = 1;
                this.list[j][key + 'dis'] = true;
              } else {
                break;
              }
            }
            i = j;
          }
        }
      }
      this.$nextTick(() => {
        this.initTableHei();
        this.initTableWid();
      });
    },
    // 处理render数据
    dealRenderList (list) {
      let nlist = [];
      let kstr = []; // 记录
      let knum = {};
      list.forEach((item) => {
        let obj = {};
        for (let k in item) {
          obj[k] = item[k];
        }
        nlist.push(obj);
      });
      this.columnsKey.forEach((keyobj, index) => {
        let k = keyobj.key;
        // 执行样式
        if (keyobj.renderstyle) {
          nlist.map((item) => {
            try {
              item[k + 'style' + index] = keyobj.renderstyle(item);
            } catch (error) {
              // console.log(item[k]);
              // console.log(error);
            }
          });
        }
        // 执行数据处理
        if (keyobj.render && kstr.indexOf(k) === -1) {
          nlist.map((item) => {
            try {
              item[k] = keyobj.render(item[k], item);
            } catch (error) {
              // console.log(item[k]);
              // console.log(error);
            }
          });
          kstr.push(k);
        }
      });
      return nlist;
    }
  }
};
</script>

<style scoped>
.mergin-table-row {
  position: relative;
}
.mergin-table-container {
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
}
.mergin-table-box {
  /* max-height: 500px; */
  overflow: auto;
}
.mergin-table-head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
}

.mergin-table-left {
  position: absolute;
  /* top: 113px; */
  z-index: 2;
}

.mergin-table-row1 .mergin-table-left-top th,
.mergin-table-row1 .mergin-table-head tr:nth-child(1) th:nth-child(1),
.mergin-table-row1 .mergin-table-box tr:nth-child(1) th:nth-child(1) {
  height: 50px;
}
.mergin-table-row1 .mergin-table-left {
  top: 50px;
}

.mergin-table-row2 .mergin-table-left-top th,
.mergin-table-row2 .mergin-table-head tr:nth-child(1) th:nth-child(1),
.mergin-table-row2 .mergin-table-box tr:nth-child(1) th:nth-child(1) {
  height: 75px;
}
.mergin-table-row2 .mergin-table-left {
  top: 75px;
}
.mergin-table-row3 .mergin-table-left-top th,
.mergin-table-row3 .mergin-table-head tr:nth-child(1) th:nth-child(1),
.mergin-table-row3 .mergin-table-box tr:nth-child(1) th:nth-child(1) {
  height: 113px;
}
.mergin-table-row3 .mergin-table-left {
  top: 113px;
}
.mergin-table-left-top {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
}
.mergin-table-left-top {
  border-right: 1px solid #fff;
}
.mergin-table-left {
  border-right: 1px solid #eee;
}
.merge-table {
  border-collapse: collapse;
  position: relative;
  top: 0;
  table-layout: fixed;
}
.mergin-table-left-top .merge-table {
  top: 0;
}
.mergin-table-box .merge-table,
.mergin-table-head .merge-table {
  min-width: 100%;
}
.merge-table td {
  border-collapse: collapse;
  border: 1px solid #eee;
  padding: 8px 4px;
  background: #fff;
}
.merge-table th {
  border-collapse: collapse;
  border: 1px solid #fff;
  padding: 8px 4px;
  background: #e2efdb;
  font-size: 14px;
  color: #808080;
  text-align: center;
  border-top: 0;
  min-width: 100px;
  white-space: nowrap;
  position: relative;
}
.merge-table td:nth-child(1),
.merge-table th:nth-child(1) {
  border-left: 0;
}
.merge-table td:last-child,
.merge-table th:last-child {
  border-right: 0;
}
.mergin-table-left-top .merge-table th,
.merge-table tr:nth-child(1) th.left-fixed-th,
.mergin-table-left td {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
}
.merge-table td {
  font-size: 12px;
}
td.hide {
  display: none;
}
td.text-right {
  text-align: right;
}
td.text-left {
  text-align: left;
}
td.text-center {
  text-align: center;
}
.mergin-table-head .sort {
  position: absolute;
  right: 4px;
  top: 50%;
  width: 20px;
  height: 20px;
  background-image: url(../../../../assets/icons/sort.svg);
  background-size: cover;
  /* border-style: solid;
  border-width: 8px;
  border-top-color: gray;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent; */
  cursor: pointer;
  margin-top: -10px;
  transform: rotate(180deg);
}
.mergin-table-head .sortasc {
  /* margin-top: -4px; */
  transform: rotate(0deg);
}
.mergin-table-head .actsort {
  background-image: url(../../../../assets/icons/sortdesc.svg);
  /* border-top-color: #2d8cf0; */
}
.action-td {
  cursor: pointer;
}
</style>
