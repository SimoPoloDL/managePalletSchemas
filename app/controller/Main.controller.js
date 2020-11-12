sap.ui.define([
   'jquery.sap.global',
   'sap/m/GroupHeaderListItem',
   'sap/ui/model/json/JSONModel',
   'sap/m/MessageBox',
   'sap/m/MessageToast',
   'sap/m/Dialog',
   'sap/ui/model/Filter',
   'sap/ui/model/FilterOperator',
   './BaseController',
   '../model/CommonManager'
], function(jQuery, GroupHeaderListItem, JSONModel, MessageBox, MessageToast, Dialog, Filter, FilterOperator, BaseController, CommonCallManager) {
   "use strict";

   var MainController = BaseController.extend("managepalletschemas.controller.Main", {
      modelInfo: new JSONModel(),

      onInit: function() {
         this.modelInfo.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
         this.getView().setModel(this.getInfoModel(), "info");

      //   this.tableRefill = this.getView().byId("tableRefill");
      //   this.tableRefill.setModel(this.modelRefill, "modelRefill");

      },
      onAfterRendering: function() {

      },
      getLines: function() {
         var that = this;

         var transaction = "ES/TRANSACTIONS/SWIMLANE/managepalletschemas/GET_ASSEMBLY_LINES";

         function success(data) {
            if (data.Rows) {
               that.modelLines.setProperty("/", data.Rows);
            }
         }

         function failure(err) {
            that._busyDialog.close();
            MessageToast.show("Errore JS funzione getLines");
         }

         var callData = {
            Mock: 'line'
         };

         CommonCallManager.getRows(transaction, callData, success, failure);
      },
      onPressButtonSettings: function() {
         this.getLineSettings();

         if (!this._settingsDialog) {
            this._settingsDialog = sap.ui.xmlfragment("managepalletschemas.view.SettingsDialog", this);
            this.getView().addDependent(this._settingsDialog);
            this._settingsDialog.setModel(this.modelSettings, "modelSettings");
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._settingsDialog);
         this._settingsDialog.open();
      },
      getData: function() {
         var that = this;

         if (!this._busyDialog) {
            this._busyDialog = sap.ui.xmlfragment("managepalletschemas.view.BusyDialog", this);
            this.getView().addDependent(this._busyDialog);
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var transaction = "ES/TRANSACTIONS/SWIMLANE/managepalletschemas/GET_REFILL_CHASSIS";

         function success(data) {
            if (data.Rows) {
               that.modelRefill.setProperty("/", data.Rows);
            } else {}
            that._busyDialog.close();

         }

         function failure(err) {
            that._busyDialog.close();
            MessageToast.show("Errore JS funzione getLineSetttings");
         }

         var callData = {
            Mock: 'dataChassis'
         };

         CommonCallManager.getRows(transaction, callData, success, failure);
      }
   });

   return MainController;
});
