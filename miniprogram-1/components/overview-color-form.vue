<template>
  <div class="milestone">
    <Form ref="form" :rules="formValidate" :label-width="140" :model="form">
      <FormItem label="里程碑节点" prop="milestoneNodeId">
        <Select v-model="form.milestoneNodeId" placeholder="请选择">
           <Option v-for="(item, index) in milenodelist" :value="item.id" :key="index">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="里程碑类型" prop="milestoneTypeId">
        <Select v-model="form.milestoneTypeId" placeholder="请选择">
           <Option v-for="(item, index) in miletypelist" :value="item.id" :key="index">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem v-if="contractId === null || contractId === undefined" label="合同编号" prop="contractId">
        <Select v-model="form.contractId" placeholder="请选择">
           <Option v-for="(item, index) in contractlist" :value="item.id" :key="index">{{item.contractName}}</Option>
        </Select>
      </FormItem>
      <FormItem label="里程碑说明" prop="descripiton">
        <Input v-model="form.descripiton" type="textarea"/>
      </FormItem>
      <FormItem label="里程碑比例" prop="percent">
        <Input-number v-model="percent" :min="0" :max="100" style="width:200px;" />
        %
      </FormItem>
      <FormItem label="里程碑服务金额" prop="serviceAmount">
        <Input-number v-model="form.serviceAmount" :formatter="commonfns.moneyValid" :min="0" style="width:200px;" />
        <span>
          {{ form.serviceAmount | moneyformat }}
        </span>
      </FormItem>
      <FormItem label="里程碑金额" prop="amount">
        <Input-number v-model="form.amount" :formatter="commonfns.moneyValid" :min="0" style="width:200px;" />
        <span>
          {{ form.amount | moneyformat }}
        </span>
      </FormItem>
      <FormItem label="已暂估金额" prop="estimateAmount">
        <Input-number v-model="form.estimateAmount" :formatter="commonfns.moneyValid" :min="0" style="width:200px;" />
        <span>
          {{ form.estimateAmount | moneyformat }}
        </span>
      </FormItem>
      <FormItem label="去除暂估金额" prop="offestimateAmount">
        <!-- <Input-number v-model="form.offestimateAmount" :formatter="commonfns.moneyValid" :min="0" style="width:200px;" /> -->
        <span>
          {{ form.offestimateAmount = isNaN((form.amount - form.estimateAmount)) ? 0: (form.amount - form.estimateAmount) | moneyformat }}
        </span>
      </FormItem>
      <FormItem label="里程碑状态" prop="status">
        <Select v-model="form.status" placeholder="请选择">
           <Option v-for="(item, index) in milestatuslist" :value="item.id" :key="index">{{item.name}}</Option>
        </Select>
      </FormItem>
      <FormItem label="原计划里程碑" prop="planDate">
        <Date-picker :value="form.planDate" format="yyyy-MM-dd" type="date" placeholder="选择日期" @on-change="formattime($event, 'planDate')"></Date-picker>
      </FormItem>
      <FormItem label="里程碑预计完成日期" prop="completePlanDate">
        <Date-picker :value="form.completePlanDate" format="yyyy-MM-dd" type="date" placeholder="选择日期" @on-change="formattime($event, 'completePlanDate')"></Date-picker>
      </FormItem>
      <FormItem label="里程碑实际完成日期" prop="completeDate">
        <Date-picker :value="form.completeDate" format="yyyy-MM-dd" type="date" placeholder="选择日期" @on-change="formattime($event, 'completeDate')">
        </Date-picker>
      </FormItem>
      <FormItem label="备注" prop="note">
        <Input v-model="form.note" type="textarea"/>
      </FormItem>
    </Form>
    <Row class="code-row-bg" justify="end" type="flex">
      <Button @click="cancel" style="margin-right:10px">取消</Button>
      <Button v-if="submitStatus !== 2" @click="save($event, 1)" type="primary" style="margin-right:10px">保存</Button>
      <Button @click="save($event, 2)" type="success">提交</Button>
    </Row>
  </div>
</template>
<script>
import { pageparam } from '@/common/listparams';
import { milestoneinfoApi } from '@/api/baseinfo/milepost/milestoneinfo';
import { milestonenodeApi } from '@/api/baseinfo/milepost/milestonenote';
import { milestonetypeApi } from '@/api/baseinfo/milepost/milestonetype';
import { milestonestatusApi } from '@/api/baseinfo/milepost/milestonestatus';
import { contractApi } from '@/api/promanage/contract';
import commonfilters from '@/common/filters';
export default {
  name: 'BusinessLineForm',
  components: {
  },
  props: {
    // 是否为更新表单
    isUpdate: {
      type: Boolean,
      default: true
    },
    // 更新的表单数据对象
    updateData: {
      type: Object
    },
    projectInfoId: { // 项目id
      type: Number
    },
    contractId: { // 合同id
      type: Number
    },
    contractAmount: { // 合同总金额
      type: Number
    }
  },
  data () {
    return {
      percent: 0,
      submitStatus: 0,
      contractform: {
        proId: null
      },
      contractlist: [], //  合同下拉列表
      // 表单数据
      form: {
        'projectInfoId': null,
        'contractId': null,
        'amount': 0,
        'completeDate': '',
        'completePlanDate': '',
        'deleted': 0,
        'descripiton': '',
        'estimateAmount': 0,
        'milestoneNodeId': null,
        'milestoneTypeId': null,
        'note': '',
        'offestimateAmount': 0,
        'percent': 0,
        'planDate': '',
        'serviceAmount': 0,
        'status': null
      },
      // 表单验证
      formValidate: {
        milestoneTypeId: [
          { required: true, type: 'number', message: '请选择里程碑类型', trigger: 'change' }
        ],
        contractId: [
          { required: true, type: 'number', message: '请选择合同编号', trigger: 'change' }
        ],
        milestoneNodeId: [
          { required: true, type: 'number', message: '请选择里程碑节点', trigger: 'change' }
        ]
        // descripiton: [
        //   { required: true, message: '请选择里程碑说明', trigger: 'blur' }
        // ],
        // percent: [
        //   { required: true, type: 'number', message: '格式不对，请重新输入', trigger: 'blur' }
        // ],
        // serviceAmount: [
        //   { required: true, type: 'number', message: '请输入里程碑服务金额', trigger: 'blur' }
        // ],
        // estimateAmount: [
        //   { required: true, type: 'number', message: '请输入已暂估金额', trigger: 'blur' }
        // ],
        // status: [
        //   { required: true, type: 'number', message: '请选择里程碑状态', trigger: 'change' }
        // ],
        // completePlanDate: [
        //   { required: true, message: '请选择里程碑预计完成时间', trigger: 'blur' }
        // ],
        // planDate: [
        //   { required: true, message: '请选择原计划里程碑时间', trigger: 'blur' }
        // ],
        // amount: [
        //   { required: true, type: 'number', message: '请输入里程碑金额', trigger: 'blur' }
        // ]
      },
      milenodelist: [], // 里程碑节点
      miletypelist: [], // 里程碑类型
      milestatuslist: [] // 里程碑状态
    };
  },
  watch: {
    updateData: function (newValue, oldValue) {
      this.$refs['form'].resetFields();
      if (this.isUpdate) {
        for (let k in this.form) {
          this.$set(this.form, k, newValue[k]);
          if (k === 'percent') {
            this.percent = commonfilters.formartPercent(newValue[k]);
          }
        }
        this.submitStatus = newValue.submitStatus;
        this.$set(this.form, 'id', newValue['id']);
      }
    },
    isUpdate: function (newValue, oldValue) {
      if (!newValue) {
        this.resetForm();
        this.$refs['form'].resetFields();
      }
    },
    contractId: function (newValue, oldValue) {
      this.$set(this.form, 'contractId', newValue);
    },
    projectInfoId: function (newValue, oldValue) {
      this.$set(this.contractform, 'projectId', newValue);
      if (newValue) {
        this.getcontractlist();
      }
    }
  },
  created () {},
  mounted () {
    this.getMileNodeList();
    this.getMileTypeList();
    this.getmilestatuslist();
    this.contractform.projectId = this.form.projectInfoId;
    Object.assign(this.contractform, pageparam);
  },
  methods: {
    formattime (d, k) {
      if (d) {
        this.form[k] = d + ' 00:00:00';
      } else {
        this.form[k] = '';
      }
    },
    // 获取合同列表
    async getcontractlist () {
      let obj = await contractApi.getlist(this.contractform);
      if (obj.success) {
        this.contractlist = obj.data.list;
      }
    },
    // 获取里程碑状态
    async getmilestatuslist () {
      let obj = await milestonestatusApi.getlist(pageparam);
      if (obj.success) {
        this.milestatuslist = obj.data.list;
      }
    },
    // 里程碑节点信息
    async getMileNodeList () {
      let obj = await milestonenodeApi.getlist(pageparam);
      if (obj.success) {
        this.milenodelist = obj.data.list;
      }
    },
    // 里程碑类型信息
    async getMileTypeList () {
      let obj = await milestonetypeApi.getlist(pageparam);
      if (obj.success) {
        this.miletypelist = obj.data.list;
      }
    },
    cancel () {
      this.$emit('on-form-close');
    },
    save (e, type) {
      this.form.percent = this.percent / 100;
      this.form.submitStatus = type;
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            this.update();
          } else {
            this.add();
          }
        } else {
          this.$Message.error('参数验证错误，请仔细填写表单数据!');
        }
      });
    },
    resetForm () {
      this.percent = 0;
      this.form = {
        'projectInfoId': this.projectInfoId,
        'contractId': this.contractId,
        'amount': 0,
        'completeDate': '',
        'completePlanDate': '',
        'deleted': 0,
        'descripiton': '',
        'estimateAmount': 0,
        // 'milestoneNodeId': null,
        // 'milestoneTypeId': null,
        'note': '',
        'offestimateAmount': 0,
        'percent': 0,
        'planDate': '',
        'serviceAmount': 0
        // 'status': null
      };
      this.$refs['form'].resetFields();
    },
    async add () {
      this.$Spin.show();
      this.form.projectInfoId = this.projectInfoId;
      this.form.contractId = this.contractId;
      let res = await milestoneinfoApi.addinfo(this.form);
      this.$Message.success(res.msg);
      this.$Spin.hide();
      this.resetForm();
      this.$emit('on-form-close');
    },
    async update () {
      this.$Spin.show();
      this.form.projectInfoId = this.projectInfoId;
      this.form.contractId = this.contractId;
      let res = await milestoneinfoApi.updateinfo(this.form);
      this.$Message.success(res.msg);
      this.$Spin.hide();
      this.resetForm();
      this.$emit('on-form-close');
    }
  }
};
</script>

<style scoped>
    .ivu-form-item {
        margin-bottom: 14px;
    }
     .milestone >>> .ivu-form-item-error-tip {
        padding-top: 2px;
        font-size: 10px;
    }
</style>
