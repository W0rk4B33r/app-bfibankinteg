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
			AppUI5.fShowBusyIndicator(10000);
			var sUserName = this.getView().byId("Username");
			var sPassword = this.getView().byId("Password");
			var sDBCompany = this.getView().byId("selectDatabase");
			var oLoginCredentials = {};
			oLoginCredentials.CompanyDB = sDBCompany.getSelectedItem().getKey();
			oLoginCredentials.UserName = sUserName.getValue();//"manager";
			oLoginCredentials.Password = sPassword.getValue();//"1234";
			$.ajax({
				url: "https://18.141.110.57:50000/b1s/v1/Login",
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
				success: function (json) {
					//AppUI5.fPostToActivityLog("","LOGIN","Login Bank Integration",sUserName.getValue(),"Success");
				}
			}).done(function (results) {
				if (results) {
					this.onLoadUDTandUDF();
					sap.m.MessageToast.show("Welcome : " + sUserName.getValue() + "!"); 
					jQuery.sap.storage.Storage.put("dataBase",sDBCompany.getSelectedItem().getKey());
					jQuery.sap.storage.Storage.put("userCode",sUserName.getValue());
					jQuery.sap.storage.Storage.put("isLogin",true);
					sap.ui.core.UIComponent.getRouterFor(this).navTo("Main");
					AppUI5.fHideBusyIndicator();
				}
			});
		},
		//---- If Session is 30 mins Already 
		// hidePanelAgain: function (passedthis) {
        //     MessageToast.show("Timed Out");
        //     jQuery.sap.storage.Storage.clear();
        //     sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
        // },
		//GET ALL Database
		fGetAllRecords: function(queryTag){
			// var aReturnResult = [];
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName=051021_TEST_DEV_PROD_BIOTECH&procName=spAppBankIntegration&QUERYTAG="+ queryTag +
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
		},
		onLoadUDTandUDF: function(){
			this.loadUDandUDF();
		},
		loadUDandUDF:function(){
		//   //create udt
		//   //Payement Processing Draft  Header
		//   AppUI5.createTable("APP_OPPD", "Payment Processing - Header", "bott_NoObject");
		//   //Payement Processing Details
		//   AppUI5.createTable("APP_PPD1", "Payment Processing - Details", "bott_NoObject");
		//   //Saved Draft OutGoing Payment
		//   AppUI5.createTable("APP_ODOP", "Payment File Extraction - Head", "bott_NoObject");
		//   //Saved Draft OutGoing Payment
		//   AppUI5.createTable("APP_DOP1", "Payment File Extraction - Det", "bott_NoObject");
		// //ACTIVITY LOG
		//   AppUI5.createTable("APP_ACTIVITYLOGS", "Activity Log", "bott_NoObject");
		// //ERROR LOG
		//   AppUI5.createTable("APP_ERRORLOGS", "Error Log", "bott_NoObject");
		// AppUI5.createTable("APP_INTRCMPY_LOGS", "Intercompany Logs", "bott_NoObject");

		//   //create udf
		//   //Payement Processing Header
		//   AppUI5.createField("App_DocNum", "Document Number", "@APP_OPPD", "db_Alpha", "", 254);
		//   AppUI5.createField("App_DateFrom", "Date From", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DateTo", "Date To", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Suppliercode", "Supplier Code", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_SupplierName", "Supplier Name", "@APP_OPPD", "db_Alpha", "", 100);
		//   AppUI5.createField("App_TaggingDate", "Tagging Date", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Status", "Status", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Remarks", "Remarks", "@APP_OPPD", "db_Alpha", "", 250);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_OPPD", "db_Alpha", "", 30);
		// 	 AppUI5.createField("App_DraftReference", "Draft Reference", "@APP_OPPD", "db_Alpha", "", 30)
		//   //Payement Processing Details
		//   AppUI5.createField("App_DocNum", "Document Number", "@APP_PPD1", "db_Alpha", "", 200);
		//   AppUI5.createField("App_Priority", "Priority", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_InvDocNum", "Invoice DocNum", "@APP_PPD1", "db_Alpha", "", 25);
		//   AppUI5.createField("App_InvoiceDocType", "Invoice DocType Type", "@APP_PPD1", "db_Alpha", "", 25);
		//   AppUI5.createField("App_InvoiceNo", "Invoice Number", "@APP_PPD1", "db_Alpha", "", 20);
		//   AppUI5.createField("App_InvoiceDate", "Invoice Date", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CheckDate", "Check Date", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_SuppRefNo", "Supplier Reference No", "@APP_PPD1", "db_Alpha", "", 25);
		//   AppUI5.createField("App_Remarks", "Remarks", "@APP_PPD1", "db_Alpha", "", 250);
		//   AppUI5.createField("App_InvoiceType", "Invoice Type", "@APP_PPD1", "db_Alpha", "", 10);
		//   AppUI5.createField("App_Desc", "Description", "@APP_PPD1", "db_Alpha", "", 250);
		//   AppUI5.createField("App_InvoiceCur", "Invoice Currency", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_InvoiceTotal", "InvoiceTotal", "@APP_PPD1", "db_Float", "st_Sum", 30);
		//   AppUI5.createField("App_RemainingBal", "RemainingBal ", "@APP_PPD1", "db_Float", "st_Sum", 30);
		//   AppUI5.createField("App_PaymentAmount", "PaymentAmount ", "@APP_PPD1", "db_Float", "st_Sum", 30);
		//   AppUI5.createField("App_CRANo", "CRA Number", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_LineNumber", "PaymentAmount ", "@APP_PPD1", "db_Numeric", "", 30);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_PPD1", "db_Alpha", "", 30);
		// 	AppUI5.createField("App_DraftReference", "Draft Reference", "@APP_PPD1", "db_Alpha", "", 30)
		// AppUI5.createField("App_WTax", "WTaxAmount", "@APP_PPD1", "db_Alpha", "", 30)
		// 	AppUI5.createField("App_WTaxRate", "WTax Rate", "@APP_PPD1", "db_Alpha", "", 30)
		// 	AppUI5.createField("App_Tax", "Tax", "@APP_PPD1", "db_Alpha", "", 30)
		// 	AppUI5.createField("App_TaxCode", "Tax Code", "@APP_PPD1", "db_Alpha", "", 30)

		//   // Saved Draft OutGoing Payment
		//   AppUI5.createField("App_DocEntry", "Document Entry", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DocNum", "Batch Number", "@APP_ODOP", "db_Alpha", "", 200);
		//   AppUI5.createField("App_PNBPrntBrnch", "PNB Printing Branch", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DistPatchTo", "Dispatch To", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DispatchCode", "Dispatch Code", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DispatchName", "Dispatch Name", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_PNBAccountNo", "PNB Account No", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_PNBAccountName", "PNB Account Name", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Remarks", "Remarks", "@APP_ODOP", "db_Alpha", "", 254);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Status", "Status", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DraftNo", "Draft Number", "@APP_ODOP", "db_Alpha", "", 30);
		//   //tagging if Outgoing payment is created from this integ
		//   AppUI5.createField("App_isFromBankInteg", "Status", "OPDF", "db_Alpha", "", 30);
		//   //Payement Processing Details
		//   AppUI5.createField("App_DocNum", "Batch Number", "@APP_DOP1", "db_Alpha", "", 200);
		//   AppUI5.createField("App_DocEntry", "Document Entry", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DraftNo", "Draft Number", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_InvDocNum", "Inv. Document Number", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_DOP1", "db_Alpha", "", 30);
		//   //Add App_BatchNum in A/R invoice once tagged batch
		//   //AppUI5.createField("App_BatchNum", "Batch Number", "OPCH", "db_Alpha", "", 30);
		//   //Add App_BatchNum in A/P Downpayment once tagged batch
		//   AppUI5.createField("App_BatchNum", "Batch Number", "ODPO", "db_Alpha", "", 30);

		// // ACTIVITY LOG
		// AppUI5.createField("App_Table", "Table Affected", "@APP_ACTIVITYLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("App_Operation", "Operation", "@APP_ACTIVITYLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("App_Key1", "Transaction Number", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_Key2", "Transaction Type", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_Key3", "Transaction Type", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_Process", "Process", "@APP_ACTIVITYLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("App_ProcessBy", "Process By", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_ProcessDate", "Process Date", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		//   AppUI5.createField("APP_NEWVAL", "New Values", "@APP_ACTIVITYLOGS", "db_Memo", "" );
		// AppUI5.createField("APP_OLDVAL", "Old Values", "@APP_ACTIVITYLOGS", "db_Memo", "");
		// AppUI5.createField("App_Status", "Status", "@APP_ACTIVITYLOGS", "db_Alpha", "", 100);

		// //error Log
		// AppUI5.createField("TableAffected", "Table Affected", "@APP_ERRORLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("Operation", "Operation", "@APP_ERRORLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("Key1", "Key1", "@APP_ERRORLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("Key2", "Key2", "@APP_ERRORLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("Key3", "Key3", "@APP_ERRORLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("ErrorDesc", "Error Description", "@APP_ERRORLOGS", "db_Alpha", "", 254);
		// AppUI5.createField("Process", "Process", "@APP_ERRORLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("ProcessBy", "Process By", "@APP_ERRORLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("ProcessDate", "Process Date", "@APP_ERRORLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("INPUTBODY", "INPUT BODY", "@APP_ERRORLOGS", "db_Memo", "");

		// ////InterCompany Logs
		// AppUI5.createField("PODocEntry ", "PO DocEntry", "@APP_INTRCMPY_LOGS", "db_Alpha", "", 20);
		// AppUI5.createField("CreatedDate ", "Created Date", "@APP_INTRCMPY_LOGS", "db_Alpha", "", 31);
		// AppUI5.createField("SyncStatus ", "Sync Status", "@APP_INTRCMPY_LOGS", "db_Alpha", "", 15);
		// AppUI5.createField("LastSyncErr ", "Last Sync Error", "@APP_INTRCMPY_LOGS", "db_Alpha", "", 200);
		// AppUI5.createField("UpdatedDate ", "Updated Date", "@APP_INTRCMPY_LOGS", "db_Alpha", "", 31);
		// AppUI5.createField("PODocNum  ", "PODocNum ", "@APP_INTRCMPY_LOGS", "db_Alpha", "", 15);
		}
		
	});
});

