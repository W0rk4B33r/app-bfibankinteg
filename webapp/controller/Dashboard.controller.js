sap.ui.define([
  "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
  "use strict";

  return Controller.extend("com.apptech.app-bankinteg.controller.Dashboard", {

    onRoutePatternMatched: function (event) {
			document.title = "BFI BANKINTEGRATION";
		},

    onInit: function () {
      //	jQuery.sap.intervalCall(3000, this , "showMessage", [this]);
        
        var route = this.getOwnerComponent().getRouter().getRoute("Dashboard");
        route.attachPatternMatched(this.onRoutePatternMatched, this);
        //get DataBase loggedin
        this.dataBase = jQuery.sap.storage.Storage.get("dataBase");	
        
        this.oMdlDataCount = new sap.ui.model.json.JSONModel();
        $.ajax({
          url: "https://18.141.110.57:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.dataBase +"&procName=spAppBankIntegration&QUERYTAG=getStatusCount&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
          type: "GET",
          async: false,
          dataType: "json",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
          },
          error: function (xhr, status, error) {
            MessageToast.show(error);
          },
          success: function (json) {},
          context: this
        }).done(function (results) {
          if (results) {
            this.oMdlDataCount.setJSON("{\"alldatacount\" : " + JSON.stringify(results).replace("[","").replace("]","") + "}");
            this.getView().setModel(this.oMdlDataCount, "oMdlDataCount");
            // var a = results[0].Draft;
            // var b = results[0].Saved;
            // var c = results[0].Cancelled;
            // this.getView().byId("testing").setValue(b);
            // this.getView().byId("Draft").setValue(a);
            // this.getView().byId("Saved").setValue(b);
            // this.getView().byId("Cancelled").setValue(c);
          }
        });	
      },



  });
});
