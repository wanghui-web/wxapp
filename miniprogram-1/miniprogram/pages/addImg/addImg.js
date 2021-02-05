//index.js
const app = getApp()
Page({
  data: {
    showImg: false,
    imgsrc: '',
    // form: {
      // '_openid': app.globalData._openid,
      // 'author': app.globalData.userInfo.nickName,
      // 'authorimg': app.globalData.userInfo.avatarUrl,
    //   'desc': '',
    //   'source': '',
    //   'url': '',
    //   'name': ''
    // },
    formVaild: {
      url: {
        name: '网址',
        required: true
      },
      name: {
        name: '名称',
        required: true,
        maxLen: 30,
        minLen: 2
      },
      desc: {
        name: '描述',
        required: true,
        maxLen: 30,
        minLen: 2
      },
      source: {
        name: '来源',
        required: true,
        minLen: 2
      }
    }
  },
  onLoad: function () {
    this.setData({
      form: {
        '_openid': app.globalData._openid,
        'author': app.globalData.userInfo.nickName,
        'authorimg': app.globalData.userInfo.avatarUrl,
      }
    })
  },
  formSubmit: function (e) {
    let formd = {
      '_openid': app.globalData._openid,
      'author': app.globalData.userInfo.nickName,
      'authorimg': app.globalData.userInfo.avatarUrl,
      'desc': '',
      'source': '',
      'url': '',
      'name': ''
    }
    let uform = e.detail.value;
    for (let k in uform) {
      if (uform[k]) {
        formd[k] = uform[k];
      }
    }
    let vaildresult = this.vaildform(formd);
    if (!vaildresult.success) {
      wx.showModal({
        title: '提示',
        content: vaildresult.msg
      });
    } else {
      const db = wx.cloud.database();
      db.collection('IMG-INFO').add({
        data: formd,
        success: res => {
          wx.showModal({
            title: '提示',
            content: '新增记录成功',
            success: function () {
              wx.redirectTo({
                url: '../index/index',
              })
            }
          });
        }
      });
    }
  },
  formReset: function () {
    this.setData({
      imgsrc: ''
    });
  },
  // 验证
  vaildform: function(obj) {
    let result = { success: true, msg: ''};
    let rules = this.data.formVaild;
    for (let k in rules) {
      console.log(obj[k]);
      let kn = k + '字段';
      if (rules[k].name) {
        kn = rules[k].name;
      }
      if (rules[k].required && !obj[k]) {
        result.success = false;
        result.msg = kn + '不能空';
        break;
      }
      if (obj[k]) {
        if (rules[k].minLen && obj[k].length < rules[k].minLen) {
          result.success = false;
          result.msg = kn + '至少需要' + rules[k].minLen + '个字符';
          break;
        }
        if (rules[k].maxLen && obj[k].length > rules[k].maxLen) {
          result.success = false;
          result.msg = kn + '不能超过' + rules[k].maxLen + '个字符';
          break;
        }
        if (rules[k].reg && !rules[k].reg.test(obj[k])) {
          result.success = false;
          rresult.msg = kn + '验证失败！请重新输入';
          break;
        }
      }
    }
    return result;
  },
  openpreview: function () {
    this.setData({
      showImg: true
    });
  },
  closepreview: function () {
    this.setData({
      showImg: false
    })
  },
  bindModel: function (e) {
    let k = e.target.dataset.model;
    this.setData({
      [k]: e.detail.value
    });
  }
})
