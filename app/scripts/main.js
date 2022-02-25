const rules = {
  lastName: "required",
  firstName: "required",
  gender: "required",
  month: "required",
  day: "required",
  email: {
    required: true,
    email: true,
    // remote: {
    //   url: "https://proxcrm.xgate.com/app/index.php/webforms/form/ajaxCheckRepeat",
    //   type: "get",
    //   dataType: "json",
    //   data: {
    //     value: $("#email").val(),
    //     type: "email",
    //   },
    //   dataFilter: function (data, type) {
    //     //AJAX异步返回数据
    //     console.log(data, type);
    //     if (data === "OK") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    // },
  },
  phone: {
    required: true,
    isMobile: true,
    remote: {
      url: "./text.html",
      type: "get",
      dataType: "html",
      data: {
        value: $("#phone").val(),
        type: "phone",
      },
      dataFilter: function (data, type) {
        const search = window.location.search.replace("?", "");
        if (!search) return false;
        const { only } = transformJson(search);
        //AJAX异步返回数据
        if (!!only) {
          $(".getCode").removeClass("disabled");
          return true;
        } else {
          $(".getCode").addClass("disabled");
          return false;
        }
      },
    },
  },
  code: "required",
  store: "required",
  statementOne: "required",
  statementTwo: "required",
};
const messages = {
  lastName: "請輸入姓氏 Please fill in surname",
  firstName: "請輸入名字 Please fill in first name",
  gender: "請選擇正確性別 Please select correct gender",
  month: "請選擇出生月份 Please select month for birthday",
  day: "請選擇出生日 Please select day for birthday",
  email: {
    required: "請輸入電郵地址 Please fill in email",
    email: "請輸入正確電郵地址 Please fill in correct email",
    // remote:
    // "每個電郵地址只可登記一次 Each email address can be registered only once",
  },
  phone: {
    required: "請輸入手提電話 Please fill in phone number",
    isMobile: "請輸入正確手機號碼 Please fill in correct phone number",
    remote:
      "每個手機號碼只可登記一次 Each phone number can be registered only once",
  },
  code: "請輸入驗證碼 Please fill in verification code",
  store: "請選擇最接近你的專門店。Please select your nearest store.",
  statementOne: "請閱讀並同意 Please read and agree.",
  statementTwo:
    "請閱讀並同意個人資料收集聲明 Please read and agree the Personal Information Collection Policy.",
};
let valid = undefined;
let time = 59;

/* init */
// const min = dayjs().format();
// const max = dayjs().format("YYYY-mm-dd");

// $("#birthday").attr('');
$(function ($) {
  $("#form").validate({
    rules,
    messages,
    errorElement: "span",
    submitHandler: submitHandler,
    success: (el) => {
      // console.log(el);
      // el.map((item) => {
      //   console.log(item);
      //   if (item.id === "phone-error") {
      //     $(".getCode").removeClass("disabled");
      //   }
      // });
      // $("#sublmit").removeClass("disabled");
    },
    showErrors: function (errorMap, errorList) {
      // console.log(errorMap);
      // const list = [];
      // errorList.map((item) => {
      //   list.push(item.element.name);
      // });

      // if (list.indexOf("phone") !== -1) {
      //   $(".getCode").addClass("disabled");
      // }

      // if (list.length > 0) {
      //   $("#sublmit").addClass("disabled");
      // } else {
      // }

      this.defaultShowErrors();
    },
    errorPlacement: function (err, el) {
      const targetName = el[0].name;

      if (targetName === "code") {
        err.appendTo(el.parents(".formItem"));
        return;
      }

      err.appendTo(el.parent());
    },
  });

  $("#phone").intlTelInput({
    // allowDropdown: false,
    autoHideDialCode: false,
    // autoPlaceholder: "off",
    // dropdownContainer: document.body,
    excludeCountries: ["hk"],
    // formatOnDisplay: false,
    geoIpLookup: function (callback) {
      $.get("http://ipinfo.io", function () {}, "jsonp").always(function (
        resp
      ) {
        var countryCode = resp && resp.country ? resp.country : "";
        callback(countryCode);
      });
    },
    // hiddenInput: "full_number",
    // initialCountry: "auto",
    // localizedCountries: { 'de': 'Deutschland' },
    nationalMode: false,
    onlyCountries: ["hk", "mo"],
    // placeholderNumberType: "MOBILE",
    // preferredCountries: ['cn', 'jp'],
    // separateDialCode: true,
    utilsScript: "./scripts/utils.js",
  });
});

/* event */

// 生日选择
$("#month").on("change", function () {
  $("#day").val("");
});
$("#day").on("mousedown", function () {
  if (!!$(this).val()) return;
  const month = $("#month").val();
  const long = [1, 3, 5, 7, 8, 10, 12];
  const short = [4, 6, 9, 11];
  let dom =
    "<option value='' selected data-default>請選擇 Please select</option>";
  let day = 0;

  if (long.indexOf(Number(month)) !== -1) day = 31;
  if (short.indexOf(Number(month)) !== -1) day = 30;
  if (Number(month) === 2) day = 29;

  for (let index = 0; index <= day; index++) {
    if (index) {
      dom = dom + `<option value="${index}">${index}日</option>`;
    }
  }

  $(this).html(dom);
});

// 表单提交
$("#sublmit").on("click", function () {
  $("#form").submit();
});

$(".language").each(function () {
  $(this).on("click", (e) => {
    $(this).siblings().removeClass("current");
    $(this).addClass("current");
    e.stopPropagation();
  });
});

$(".checkbox").each(function () {
  $(this).on("click", (e) => {
    if ($(this).attr("class").indexOf("current") !== -1) {
      $(this).removeClass("current");
    } else {
      $(this).addClass("current");
    }
    e.stopPropagation();
  });
});

$(".link").each(function () {
  $(this).on("click", (e) => {
    const url = $(this).data("url");
    window.open(url, "_blank");
    e.stopPropagation();
  });
});

$("#model .button").on("click", function () {
  model().close();
});
$(".getCode").on("click", function (e) {
  if ($(this).attr("class").indexOf("disabled") !== -1) return false;
  // $.ajax({
  //   type: "POST",
  //   url: url,
  //   data: data,
  //   dataType: dataType,
  //   success: function () {

  if (time === 59) {
    setTime();
    $(this).addClass("start");
  }
  // },
  // error: function () {},
  // });
});

// 自定义验证规则
$.validator.addMethod(
  "isEmail",
  function (value, element) {
    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return this.optional(element) || reg.test(value);
  },
  "請輸入正確電郵地址 Please fill in correct email"
);
$.validator.addMethod(
  "isMobile",
  function (value, element) {
    const val = value.replace(/\s/g, "");
    const mobile =
      /^\+852(5[1234569]\d{6}$|6\d{7}$|9[0-8]\d{6}$)|^\+853[6]([8|6])\d{5}$/;

    if (!mobile.test(val)) {
      $(".getCode").addClass("disabled");
    } else {
      $(".getCode").removeClass("disabled");
    }

    return this.optional(element) || mobile.test(val);
  },
  "請輸入正確手機號碼 Please fill in correct phone number"
);

// utils

// 异步提交
function submitHandler(form) {
  const data = transformJson($(form).serialize());
  console.log(data);
  // $.ajax({
  //   type: "POST",
  //   url: url,
  //   data: data,
  //   dataType: dataType,
  //   success: function () {
  console.log(data.gender);
  if (Number(data.gender) === 106) {
    model().open(
      "謝謝您的登記!HK$100購物優惠券將於24小時內以短訊形式發送至登記手機號碼。Thank you, you have successfully registered as our new Explorer! HK$100 cash coupon will be sent to your registered mobile within 24 hours."
    );
    return false;
  } else {
    model().open("系统正忙，请稍后再试。");
  }
  // },
  // error: function () {
  model().open("系统正忙，请稍后再试。");
  // },
  // });
}

function transformJson(str) {
  return JSON.parse(
    '{"' +
      decodeURIComponent(str)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
  );
}

function model() {
  const el = $("#model");
  return {
    open: function (text) {
      el.find(".formInfo").text(text);
      el.addClass("show");
    },
    close: function () {
      el.removeClass("show");
    },
  };
}

function setTime() {
  if (time === 0) {
    $(".getCode").text("獲取驗證碼");
    $(".getCode").removeClass("start");
    time = 59;
  } else {
    $(".getCode").text(`${time}秒后重新發送`);
    time--;
    setTimeout(function () {
      setTime();
    }, 1000);
  }
}
