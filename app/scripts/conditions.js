// $(function ($) {});

const n = new model();
$("#submit").on("click", function () {
  console.log("ee");

  n.open({ text: "提交中。。。", hideButton: true });

  $.ajax({
    type: "POST",
    url: "./test.html",
    data: {
      userToken: 23443,
    },
    success: function (msg) {
      n.open({
        text: "提交失败",
        hideButton: false,
        onclickCallback: () => {
          alert("Data Saved: ");
        },
      });
    },
    error: function (err) {
      setTimeout(function () {
        n.open({
          text: "提交失败",
          onclickCallback: () => {
            window.location.replace("https://google.com");
          },
        });
      }, 1000);
    },
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
