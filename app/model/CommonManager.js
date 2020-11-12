sap.ui.define([
    'jquery.sap.global',
    './CallManager'
], function (jQuery, CallManager) {
    "use strict";
    var instance = null;

    var CommonManager = CallManager.extend("CommonManager", {
        getRows: function (transaction, cData, callbackSuccessFromController, callbackErrorFromController) {
            var that = this;

            var callData = {};
            if (cData) {
                callData = cData;
            }

            callData.Transaction = transaction;
            callData.OutputParameter = "JSON";

            var call = that.callPrototype(callData);

            call.done(jQuery.proxy(that.populateDataFromBackendGenerator(callbackSuccessFromController), that));
            call.fail(jQuery.proxy(that.callbackErrorGenerator(callbackErrorFromController), that));
        }
    });

    CommonManager.getInstance = function () {

        if (instance === null) {
            instance = new CommonManager();
        }
        return instance;
    };

    return CommonManager.getInstance();
});