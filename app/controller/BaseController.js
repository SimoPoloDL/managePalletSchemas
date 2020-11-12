/* global XMLHttpRequest, DOMParser */

sap.ui.define([
    'jquery.sap.global',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/mvc/Controller'
], function (jQuery, JSONModel, Controller) {
    "use strict";

    var BaseController = Controller.extend("BaseController",{
        model: new JSONModel({}),
        routeName: "",
        routeMatchedCallback: function (oEvent) {},
        getInfoModel: function () {
            return sap.ui.getCore().getModel("info");
        },
        getI18nModel: function () {
            return sap.ui.getCore().getModel("i18n");
        },
        toBackPage: function () {
            window.history.back();
        },
        logOff: function (event) {
            this.keepCredentials = false;
            this.cLogOut();
        },
        handleRouteMatched: function (oEvent) {
            if (this.routeName === "") {
                return;
            }

            if (!this._checkRoute(oEvent, this.routeName)) {
                return;
            }

            // arrived to this controller
            this.routeMatchedCallback();
        },
        _checkRoute: function (evt, pattern) {
            if (evt.getParameter("name") !== pattern) {
                return false;
            }

            return true;
        },
        keepCredentials: false,
        cookieMan: {
            removeCookies: function () {
                var cookies = document.cookie.split(";");
                for (var i = 0; i < cookies.length; i++) {
                    var spcook = cookies[i].split("=");
                    this.deleteCookie(spcook[0]);
                }
            },
            deleteCookie: function (cookiename) {
                var d = new Date();
                d.setDate(d.getDate() - 1);
                var expires = ";expires=" + d;
                var name = cookiename;
                var value = "";
                document.cookie = name + "=" + value + expires + "; path=/acc/html";
            }
        },
        getJSON: function (Transaction, Input) {
            var xmlHttp = new XMLHttpRequest();
            var xmlDOM;
            var aData;
            var site = this.getInfoModel().getProperty("/site");

            var trans = "/XMII/Runner?Transaction=" + site + "/TRANSACTION/" + Transaction + "&" + Input + "&SITE=" + site + "&OutputParameter=JSON&Content-Type=text/xml";
            xmlHttp.open("GET", trans, false);
            xmlHttp.send();
            var parser = new DOMParser();
            xmlDOM = parser.parseFromString(xmlHttp.responseText, "application/xml");
            if (!xmlDOM || xmlDOM !== null) {
                return;
            }
            try {
                aData = eval(xmlDOM.documentElement.textContent); // jshint ignore : line
                this.cookieMan.removeCookies();
            } catch (err) {
                alert(xmlDOM.documentElement.textContent);
            }
            return  aData;
        },
        cLogOut: function (e) {
            if (this.keepCredentials === false) {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open("GET", "/XMII/PropertyAccessServlet?mode=store&PropName=FIRST_TIME&PropValue=true", false);
                xmlHttp.send();
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open("GET", "/XMII/Illuminator?service=Logout", false);
                xmlHttp.send();
            }

            window.location.href = "../main/index.irpt";
        }
    });

    return BaseController;
});
