sap.ui.define([
  "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"com/apptech/app-bankinteg/controller/AppUI5"
], function(Controller, JSONModel ,MessageToast,AppUI5) {
  "use strict";

	return Controller.extend("com.apptech.app-bankinteg.controller.Login", {
		onInit: function () {
		//get all databse
		//this.oMdlDatabase = new JSONModel("model/databases.json");
		this.oMdlDatabase = new JSONModel();
		this.fGetAllRecords("getAllDB");
		
		},
		 action: function (oEvent) {
			var that = this;
			var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
			var eventType = oEvent.getId();
			var aTargets = actionParameters[eventType].targets || [];
			aTargets.forEach(function (oTarget) {
				var oControl = that.byId(oTarget.id);
				if (oControl) {
					var oParams = {};
					for (var prop in oTarget.parameters) {
						oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
					}
					oControl[oTarget.action](oParams);
				}
			});
			var oNavigation = actionParameters[eventType].navigation;
			if (oNavigation) {
				var oParams = {};
				(oNavigation.keys || []).forEach(function (prop) {
					oParams[prop.name] = encodeURIComponent(JSON.stringify({
						value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
						type: prop.type
					}));
				});
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		},
		onLogin: function (oEvent) {
			AppUI5.fShowBusyIndicator(4000);
			var sUserName = this.getView().byId("Username");
			var sPassword = this.getView().byId("Password");
			var sDBCompany = this.getView().byId("selectDatabase");
			var oLoginCredentials = {};
			oLoginCredentials.CompanyDB = sDBCompany.getSelectedItem().getKey();
			oLoginCredentials.UserName = sUserName.getValue();//"manager";
			oLoginCredentials.Password = sPassword.getValue();//"1234";
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/Login",
				data: JSON.stringify(oLoginCredentials),
				type: "POST",
				crossDomain: true,
                xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
				},
				context:this,
				success: function (json) {}
			}).done(function (results) {
				if (results) {
					sap.m.MessageToast.show("Session ID: " + results.SessionId); 
					jQuery.sap.storage.Storage.put("dataBase",sDBCompany.getSelectedItem().getKey());
					jQuery.sap.storage.Storage.put("userCode",sUserName.getValue());
					jQuery.sap.storage.Storage.put("isLogin",true);
					sap.ui.core.UIComponent.getRouterFor(this).navTo("PaymentProcessing");
					AppUI5.fHideBusyIndicator();
				}
			});
		},
		//GET ALL Database
		fGetAllRecords: function(queryTag){
			// var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBankIntegration&QUERYTAG="+ queryTag +
				"&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlDatabase.setJSON("{\"Database\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlDatabase, "oMdlDatabase");
				}
			});
		}
		
	});
});