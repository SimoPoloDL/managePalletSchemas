// Changes XML to JSON
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/base/Object',
    'sap/m/MessageToast',
    'sap/m/MessageBox'
], function (jQuery, Object, MessageToast, MessageBox) {
    "use strict";
    var CallManager = Object.extend("CallManager",{
      callPrototype: function (data) {

          if (!data.Transaction) {
              return function () {};
          }

          var req;
          if (jQuery.sap.getUriParameters().get("localMode") === "true") {
            req = jQuery.ajax({
                url: "model/mock/" + data.Mock + '.xml',
                method: "GET",
                dataType: "xml"
//                ,beforeSend: authFunc
            });
          } else {
            req = jQuery.ajax({
                url: "/XMII/Runner",
                data: data,
                method: "POST",
                dataType: "xml"
//                ,beforeSend: authFunc
            });
          }
          return req;
      },
        populateDataFromBackendGenerator: function (callbackSuccessFromController, callbackErrorFromController, disableMex) {
            var populateDataFromBackend = function (data, response) {
                jQuery.sap.log.debug("data: " + data);

                var toReturn = {};

                try {
                    var objRec = JSON.parse(jQuery(data).text());

                    //parsing data
                    if (objRec === undefined || objRec === "" || (objRec.length !== undefined && objRec.length === 0)) {
                        throw "No data received";
                    } else if (objRec.length === undefined) {
                        toReturn = objRec;
                    } else {
                        toReturn = [];
                        for (var indx in objRec) {
                            var obj = objRec[indx];
                            toReturn.push(obj);
                        }
                    }


                } catch (err) {
                    jQuery.sap.log.error("JSON PARSE error: " + err.message);
                    toReturn = jQuery(data).text();
                }
                if (callbackSuccessFromController) {
                    callbackSuccessFromController(toReturn, data);

                    if (disableMex !== undefined && disableMex === true) {
                        return;
                    }

                    var showMessage = function (mex) {
                        MessageToast.show(mex.Message);
                    };

                    if (toReturn.Messages && toReturn.Messages.length && toReturn.Messages.length > 0) {
                        for (var indd in toReturn.Messages) {
                            var mex = toReturn.Messages[indd];
                            showMessage(mex);
                        }
                    }

                    if (toReturn.Messages && toReturn.Messages.Message && toReturn.Messages.Message !== "") {
                        var mex2 = toReturn.Messages;
                        showMessage(mex2);
                    }

                    if (toReturn.FatalError && toReturn.FatalError !== "") {
                        jQuery.sap.log.error("FATAL error from SERVER: " + toReturn.FatalError);
                        MessageBox.error(toReturn.FatalError, {onClose: function () {
                            }
                        });
                        if (callbackErrorFromController) {
                            callbackErrorFromController(toReturn.FatalError);
                        }
                    }
                }
            };
            return populateDataFromBackend;
        },
        callbackErrorGenerator: function (callbackErrorFromController) {
            var callbackError = function (error) {
                jQuery.sap.log.error("Call error: " + error.message);
                if (callbackErrorFromController) {
                    callbackErrorFromController(error.message);
                }
            };
            return callbackError;
        }
    });

    return CallManager;
});
