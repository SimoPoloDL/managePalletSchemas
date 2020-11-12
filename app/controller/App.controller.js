sap.ui.define(['jquery.sap.global', 'sap/ui/model/json/JSONModel', 'sap/ui/core/mvc/Controller'], function(jQuery, JSONModel, Controller) {
  "use strict";

  return Controller.extend("refillchassis.controller.App", {
    onInit: function() {

      if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
          position = position || 0;
          return this.substr(position, searchString.length) === searchString;
        };
      }

      this.getCurrentUser();
    },
    getCurrentUser: function() {
      var params = {
        "Service": "Admin",
        "Mode": "UserAttribList",
        "content-Type": "text/xml"
      };

      sap.ui.getCore().setModel(new JSONModel({}), "info");

      if (jQuery.sap.getUriParameters().get("localMode") === "true") {
        var user = {
          handle: "UserBO:DLPR,ESERVICES",
          name: "ESERVICES,",
          id: "ESERVICES"
        };
        var site = "DLPR";
        window.site = site;

        sap.ui.getCore().getModel("info").setProperty("/user", user);
        sap.ui.getCore().getModel("info").setProperty("/site", site);
      } else {

        try {
          var req = jQuery.ajax({
            url: "/XMII/Illuminator",
            data: params,
            method: "GET",
            async: false
          });
          req.done(function(data, reponse) {
            var site = jQuery(data).find("DEFAULT_SITE").text();
            window.site = site;

            var fullname = jQuery(data).find("FullName").text();
            var userId = jQuery(data).find("User").text();
            var userHandle = "UserBO:" + site + "," + userId;

            var user = {
              handle: userHandle,
              name: fullname,
              id: userId
            };

            sap.ui.getCore().getModel("info").setProperty("/user", user);
            sap.ui.getCore().getModel("info").setProperty("/site", site);

          });
          req.fail(function(error) {

          });
        } catch (err) {
          jQuery.sap.log.debug(err.stack);
        }
      }
    }
  });

}, /* bExport= */ true);
