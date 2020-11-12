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

   var MainController = BaseController.extend("refillchassis.controller.Main", {
      modelInfo: new JSONModel(),
      modelLines: new JSONModel(),
      modelSettings: new JSONModel(),
      modelRefill: new JSONModel(),
      generalInfo: {},
      onInit: function() {
         this.modelInfo.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
         this.getView().setModel(this.getInfoModel(), "info");

         this.tableRefill = this.getView().byId("tableRefill");
         this.tableRefill.setModel(this.modelRefill, "modelRefill");

         this.getView().setModel(this.modelLines, "modelLines");
      },
      onAfterRendering: function() {

      },
      onBeforeRendering: function() {
         this.getLines();
         this.getData();
         var that = this;
         setInterval(function(){ that.getData(); }, 60000);
      },
      getLines: function() {
         var that = this;

         var transaction = "ES/TRANSACTIONS/SWIMLANE/REFILLCHASSIS/GET_ASSEMBLY_LINES";

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
      onParentClicked: function(oEvent) {
         var bSelected = oEvent.getParameter("selected");
         for (var i = 0; i < this.modelLines.getData().length; i++) {
            this.modelLines.setProperty("/" + i + "/SELECTED", bSelected);
         }

         if (bSelected) {
           this.tableRefill.getBinding("items").filter([], "Application");
         } else {
           var oFilter = new Filter({
              filters: [new Filter("LINENAME", FilterOperator.EQ, "ZZZ")]
           });

           this.tableRefill.getBinding("items").filter(oFilter, "Application");
         }

      },
      onSelectedLine: function() {
         var bSelected = true;
         var aFilters = [];
         for (var i = 0; i < this.modelLines.getData().length; i++) {
            bSelected = bSelected && this.modelLines.getProperty("/" + i + "/SELECTED");

            if (this.modelLines.getProperty("/" + i + "/SELECTED")) {
              aFilters.push(new Filter("LINENAME", FilterOperator.EQ, this.modelLines.getProperty("/" + i + "/LINENAME")));
            }
         }
         this.getView().byId("checkBoxAllLine").setSelected(bSelected);


         var oFilter = new Filter({
            filters: aFilters,
            and: false,
         });

         this.tableRefill.getBinding("items").filter(oFilter, "Application");
      },
      onPressButtonSettings: function() {
         this.getLineSettings();

         if (!this._settingsDialog) {
            this._settingsDialog = sap.ui.xmlfragment("refillchassis.view.SettingsDialog", this);
            this.getView().addDependent(this._settingsDialog);
            this._settingsDialog.setModel(this.modelSettings, "modelSettings");
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._settingsDialog);
         this._settingsDialog.open();
      },
      getLineSettings: function() {
         var that = this;

         if (!this._busyDialog) {
            this._busyDialog = sap.ui.xmlfragment("refillchassis.view.BusyDialog", this);
            this.getView().addDependent(this._busyDialog);
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var transaction = "ES/TRANSACTIONS/SWIMLANE/REFILLCHASSIS/GET_ZME_LINE_REFILL_CHASSIS";

         function success(data) {
            if (data.Rows) {
               that.modelSettings.setProperty("/", data.Rows);
            } else {}
            that._busyDialog.close();

         }

         function failure(err) {
            that._busyDialog.close();
            MessageToast.show("Errore JS funzione getLineSetttings");
         }

         var callData = {
            LINENAME: this.line
         };

         CommonCallManager.getRows(transaction, callData, success, failure);
      },
      onPressAdd: function(oEvent) {
         oEvent.getSource().getParent().getItems()[1].setValue(parseInt(oEvent.getSource().getParent().getItems()[1].getValue()) + 1);
      },
      onPressLess: function(oEvent) {
         oEvent.getSource().getParent().getItems()[1].setValue(parseInt(oEvent.getSource().getParent().getItems()[1].getValue()) - 1);
      },
      onPressSaveSettings: function() {
        var that = this;

        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
        this._busyDialog.open();

        var params = {
           DATA: encodeURIComponent(JSON.stringify(this.modelSettings.getData())),
           "TRANSACTION": "ES/TRANSACTIONS/SWIMLANE/REFILLCHASSIS/SAVE_ZME_LINE_REFILL_CHASSIS",
           "OutputParameter": "*"
        };

        $.ajax({
           type: 'GET',
           async: true,
           data: params,
           url: "/XMII/Runner",
           dataType: 'xml',
           success: function(result) {
              try {
                 that._busyDialog.close();
                 if (jQuery(result).find("RC").text() === "0") {
                    MessageToast.show("Settaggi salvati");
                    that.getData();
                 } else {
                    MessageBox.show(jQuery(result).find("MESSAGE").text());
                 }
              } catch (err) {
                console.log(err);
              }
           },
           error: function(error) {
              that._busyDialog.close();
              console.log(error);
           }
        });
      },
      onPressCloseSettings: function() {
         this._settingsDialog.close();
      },
      getData: function() {
         var that = this;

         if (!this._busyDialog) {
            this._busyDialog = sap.ui.xmlfragment("refillchassis.view.BusyDialog", this);
            this.getView().addDependent(this._busyDialog);
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var transaction = "ES/TRANSACTIONS/SWIMLANE/REFILLCHASSIS/GET_REFILL_CHASSIS";

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
      },
      getGroupHeader: function(oGroup) {
         return new GroupHeaderListItem({
            title: oGroup.key,
            upperCase: false
         });
      },
      getLinesInfo: function() {
         var that = this;

         if (!this._busyDialog) {
            this._busyDialog = sap.ui.xmlfragment("refillchassis.view.BusyDialog", this);
            this.getView().addDependent(this._busyDialog);
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var transaction = "ES/TRANSACTIONS/SWIMLANE/REFILLCHASSIS/Z_GET_LINE_SETTINGS_v2";

         function success(data) {
            if (data.Rows) {
               that.generalInfo = data.Rows[0];
               that.modelInfo.setData(data.Rows[0]);
            } else {}
            that._busyDialog.close();

         }

         function failure(err) {
            that._busyDialog.close();
            MessageToast.show("Errore JS funzione getLinesInfo");
         }

         var callData = {
            LINENAME: this.line
         };

         CommonCallManager.getRows(transaction, callData, success, failure);
      },
      onPressRefill: function(oEvent) {
        var currObj = oEvent.getSource().getBindingContext('modelRefill').getObject();
        var that = this;

        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
        this._busyDialog.open();

        var params = {
           ITEM: currObj.SHOP_ORDER,
           LINENAME: currObj.LINENAME,
           "TRANSACTION": "ES/TRANSACTIONS/SWIMLANE/REFILLCHASSIS/TO_DEF",
           "OutputParameter": "*"
        };

        alert("press refill");
        this._busyDialog.close();
/*
        $.ajax({
           type: 'GET',
           async: true,
           data: params,
           url: "/XMII/Runner",
           dataType: 'xml',
           success: function(result) {

              try {
                 that._busyDialog.close();
                 if (jQuery(result).find("RC").text() === "0") {
                    MessageToast.show("Refill eseguito");
                 } else {
                    MessageBox.show(jQuery(result).find("MESSAGE").text());
                 }
              } catch (err) {

              }
           },
           error: function(error) {
              that._busyDialog.close();
           }
        }); */

      },
      onPressReturn: function(oEvent) {
        var currObj = oEvent.getSource().getBindingContext('modelRefill').getObject();
        var that = this;

        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
        this._busyDialog.open();

        var params = {
           ITEM: currObj.SHOP_ORDER,
           LINENAME: currObj.LINENAME,
           "TRANSACTION": "ES/TRANSACTIONS/SWIMLANE/REFILLCHASSIS/TO_DEF",
           "OutputParameter": "*"
        };

        alert("press return");
        this._busyDialog.close();
/*
        $.ajax({
           type: 'GET',
           async: true,
           data: params,
           url: "/XMII/Runner",
           dataType: 'xml',
           success: function(result) {

              try {
                 that._busyDialog.close();
                 if (jQuery(result).find("RC").text() === "0") {
                    MessageToast.show("Refill eseguito");
                 } else {
                    MessageBox.show(jQuery(result).find("MESSAGE").text());
                 }
              } catch (err) {

              }
           },
           error: function(error) {
              that._busyDialog.close();
           }
        }); */

      },
      onPressRilascia: function(oEvent) {
         var currObj = oEvent.getSource().getBindingContext('modelOrders').getObject();
         var that = this;

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var params = {
            LINENAME: this.line,
            SHOP_ORDER: currObj.SHOP_ORDER,
            USER_ID: this.idUser,
            "TRANSACTION": "ES/TRANSACTIONS/SWIMLANE/Z_RELEASE_ORDER",
            "OutputParameter": "*"
         };

         $.ajax({
            type: 'GET',
            async: true,
            data: params,
            url: "/XMII/Runner",
            dataType: 'xml',
            success: function(result) {

               try {
                  that._busyDialog.close();
                  if (jQuery(result).find("RC").text() === "0") {
                     MessageToast.show("Ordine rilasciato");
                  } else {
                     MessageBox.show(jQuery(result).find("MESSAGE").text());
                  }
                  that.getOrders();
               } catch (err) {
                  that.getOrders();
               }
            },
            error: function(error) {
               that._busyDialog.close();
               that.getOrders();
            }
         });
      },
      getListaCicli: function() {
         var params = {
            "TRANSACTION": "ES/TRANSACTIONS/SWIMLANE/CUCINA/Z_GET_CICLO_LIST",
            "OutputParameter": "JSON"
         };

         $.ajax({
            type: 'GET',
            async: false,
            data: params,
            url: "/XMII/Runner",
            dataType: 'xml',
            success: function(result) {

               try {
                  var jsonStr = jQuery(result).text();
                  var jsonObj = JSON.parse(jsonStr);

                  //  that.modelClassificazioni.setData(jsonObj);

               } catch (err) {

               }
            },
            error: function(error) {

            }
         });
      },

      getProvaJSON: function() {
         var that = this;

         if (!this._busyDialog) {
            this._busyDialog = sap.ui.xmlfragment("refillchassis.view.BusyDialog", this);
            this.getView().addDependent(this._busyDialog);
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var transaction = "ES/TRANSACTIONS/ZZ_POLSIM/OUTPUT_JSON";

         function success(data) {
            if (data) {
               var pippo = 4343;
            } else {
               var pippo = 54343;
            }
            that._busyDialog.close();

         }

         function failure(err) {
            that._busyDialog.close();
            MessageToast.show("Errore JS funzione getMainModel");
         }

         var callData = {
            Mock: 'jsonLocalMode'
         };

         CommonCallManager.getRows(transaction, callData, success, failure);
      },
      onSettingsInputLiveChange: function(oEvent) {
         oEvent.getSource().setValue(Math.max(0, parseInt(oEvent.getSource().getValue(), 10)));
      }
   });

   return MainController;
});
