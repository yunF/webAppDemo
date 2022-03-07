$(function ($) {
  const parameter1 = getUrlParam("parameter1");
  const parameter2 = getUrlParam("parameter2");
  const timestamp = getUrlParam("timestamp");
  const appid = getUrlParam("appid");
  const sign = getUrlParam("sign");

  const n = new model();

  $("#submit").on("click", function () {
    n.open({ text: "提交中。。。", hideButton: true });

    $.ajax({
      type: "GET",
      url: `https://clmapi-hk-stg.thenorthface.com.cn/tnf-hk-uat-customer-service/v1/member/api/issigned/${parameter1}/${parameter2}`,
      headers: {
        timestamp,
        appid,
        sign,
      },
      success: function (msg) {
        const { resultCode, resultDesc } = msg;
        if (resultCode === -1) {
          n.open({
            text: resultDesc,
            hideButton: false,
          });
          return false;
        }
        n.open({
          text: "提交成功",
          hideButton: false,
        });
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
        n.open({
          text: "提交失敗,請檢查網絡連接",
        });
      },
    });
  });
});

function model(ope) {
  const el = $("#model");
  const OK = el.find(".button");
  const that = this;
  this.onclickCallback = undefined;
  this.hideButton = undefined;

  this.init = function () {
    if (this.hideButton) {
      OK.addClass("hide");
    } else {
      OK.removeClass("hide");
    }
  };

  this.open = function ({ text = "", onclickCallback, hideButton = false }) {
    onclickCallback && (this.onclickCallback = onclickCallback);
    this.hideButton = hideButton;
    this.init();
    el.find(".formInfo").text(text);
    el.addClass("show");
  };
  this.close = function () {
    if (!!this.onclickCallback) this.onclickCallback();
    el.removeClass("show");
  };

  this.init();

  OK.on("click", function () {
    that.close();
  });
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}
